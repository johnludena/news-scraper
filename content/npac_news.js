const axios = require('axios')
const cheerio = require('cheerio')
const ObjectsToCsv = require('objects-to-csv');

// The URL to scrape data from
const sourceUrl = 'https://numberportability.com/news/'

// Array of objects to store all final data before writing to CSV file
const allArticles = [];

// Function to convert array of objects to formatted CSV file
const writeToCsv = async (dataArr) => {
	const csv = new ObjectsToCsv(dataArr);

	// Save to file:
	await csv.toDisk('./content/npac_news.csv');

}

async function fetchNewsData() {
	const response = await axios.get(sourceUrl)
	const domString = response.data

	// Using Cheerio, we create a 'DOM' from the response string
	// (this will allow us to use the $ to act just like jQuery)
	const $ = cheerio.load(domString)
	const $articlesArr = $('.block-news .news-item')

	const promises = $articlesArr.map(async (index, item) => {

		let articleData = {
			title: $(item).find('.title').text(),
			date: $(item).find('.date').text(),
			summary: $(item).find('.description').text(),
			url: $(item).find('a:first-of-type').attr('href'),
			cta: 'Read Full Article',
			body: ''
		}

		const sourceIsInternal = articleData.url.indexOf('numberportability.com') > 0

		// Check if URL points to an internal resource...
		if (sourceIsInternal) {

			const articlePageResponse = await axios.get(articleData.url)
			const articleDomString = articlePageResponse.data
			const $adc = cheerio.load(articleDomString)

			// Remove H2 title inside body
			$adc('.container .rich-text > h2').remove()

			// Update our 'articleData' object with the body values and null the link fields
			articleData.body = $adc('.container .rich-text').html()
			articleData.url = '';
			articleData.cta = ''
		
			allArticles.push(articleData)

			console.log('Internal article has been pushed to array.')

		} else {
			allArticles.push(articleData)
			console.log('External article has been pushed to array.')	
		}	
	})

	await Promise.all(promises).then((values) => {
		console.log(values);
	  })
	  .catch((error) => {
		console.error(error.message)
	  });

	console.log(`The total length of allArticles array is: ${allArticles.length}`)

	// Invoke function to output data to CSV after everything is done running
	writeToCsv(allArticles)
}

fetchNewsData();