const axios = require('axios')
const cheerio = require('cheerio')
const ObjectsToCsv = require('objects-to-csv');

// The URL to scrape data from
const sourceUrl = 'https://numberportability.com/industry-info/software-releases/npac-1-0/'

// Array of objects to store all final data before writing to CSV file
const allDocuments = [];

// Function to convert array of objects to formatted CSV file
const writeToCsv = async (dataArr) => {
	const csv = new ObjectsToCsv(dataArr);

	// Save to file:
	await csv.toDisk('./documents/software_releases_1_0.csv');
}

async function fetchNewsData() {
	const response = await axios.get(sourceUrl)
	const domString = response.data

	// Using Cheerio, we create a 'DOM' from the response string
	// (this will allow us to use the $ to act just like jQuery)
	const $ = cheerio.load(domString)
	const $linksArr = $('.grid_13 a, .grid_6 a')

	const promises = $linksArr.map(async (index, item) => {

		let documentData = {
			name: $(item).text(),
			url: 'https://numberportability.com' + $(item).attr('href'),
		}

		allDocuments.push(documentData)
	})
	

	console.log(`The total length of allDocuments array is: ${allDocuments.length}`)
	console.log(allDocuments)

	// Invoke function to output data to CSV after everything is done running
	writeToCsv(allDocuments)
}

fetchNewsData();