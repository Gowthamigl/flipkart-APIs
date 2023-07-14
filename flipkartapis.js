const axios = require('axios');
const cheerio = require('cheerio');
const prompt = require('prompt');

prompt.start();

function fetchProductDetails(keyword) {
  const flipkartUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(keyword)}`;

  return axios.get(flipkartUrl)
    .then((response) => {
      const flipkartProducts = parseFlipkartResponse(response.data);
      const productPromises = flipkartProducts.map((product) => {
        return fetchSellerName(product.url)
          .then((sellerName) => {
            return { ...product, seller: sellerName };
          })
          .catch((error) => {
            console.error(`Error fetching seller name: ${error}`);
            return product; // Return the product without the seller name
          });
      });

      return Promise.all(productPromises);
    })
    .catch((error) => {
      throw new Error(`Error fetching product details: ${error}`);
    });
}

function parseFlipkartResponse(responseData) {
  const $ = cheerio.load(responseData);
  const products = [];

  $('._13oc-S').each((index, element) => {
    const productName = $(element).find('._4rR01T').text().trim();
    const productDetails = $(element).find('.rgWa7D').text().trim();
    const url = $(element).find('a').attr('href');
    const price = $(element).find('._25b18c').text().trim();

    if (productName && url && price && productDetails) {
      products.push({ productName, url, price,productDetails});
    }
  });

  return products;
}

function fetchSellerName(url) {
  return axios.get(`https://www.flipkart.com${url}`)
    .then((response) => {
      const $ = cheerio.load(response.data);
      const sellerName = $('._1RLviY').text().trim();
      return sellerName;
    });
}

// Prompt the user for the keyword
//prompt.get(['keyword'], (err, result) => {
//    if (err) {
 //     console.error(`Error reading input: ${err}`);
 //     return;
 //   }
  
 //   const keyword = result.keyword;




// Usage example
const keyword = 'macbook air m1';
 
 fetchProductDetails(keyword)
  .then((products) => {
    console.log(products);
  })
  .catch((error) => {
    console.error(`Error fetching product details: ${error}`);
  });
//});
