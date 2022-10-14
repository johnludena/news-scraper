const axios = require('axios')
const cheerio = require('cheerio');
const ObjectsToCsv = require('objects-to-csv');

// The URL to start scraping data from
const entryPoint = 'https://numberportability.com/npac-media/files/public/public-archives/'

// Array of objects to store all final data before writing to CSV file
const allDocuments = [];

// Test only
let masterCounter = 0;

// Main function to fetch data
async function fetchNewsData(sourceUrl) {

	masterCounter++;

	console.log('======== START fetchNewsData ========')

	if (masterCounter === 3) {
		console.log("============ WE HAVE REACHED THE END (FOR NOW) ==============")
		return;
	}

	const response = await axios.get(sourceUrl)
	const domString = response.data

	// Using Cheerio, we create a 'DOM' from the response string
	// (this will allow us to use the $ to act just like jQuery)
	const $ = cheerio.load(domString)
	const $linksArr = $('#contentMain a')

	// Exit immediately if no links are found
	if (!$linksArr.length) {
		console.log('===== NO LINKS FOUND FOR THIS PAGE ====== ')
		return;
	}

	const linkPromises = $linksArr.map(async (index, item) => {

		// We need to check if the URL goes to a page or links directly to a document first
		const completePath = $(item).attr('href')
		const completePathArr = completePath.split('/')
		const endPath = completePathArr[completePathArr.length - 1]

		console.log(`The current URL being evaluated is: ${'https://numberportability.com' + $(item).attr('href')}`)

		if (endPath.indexOf('.') > 0) {

			let documentData = {
				name: $(item).text(),
				url: 'https://numberportability.com' + $(item).attr('href'),
			}

			allDocuments.push(documentData)

			console.log(documentData)

			return
		}

		console.log(`!!!!${endPath} points to another URL. Calling "fetchNewsData" fn again!`)
		const nextUrl = 'https://numberportability.com' + $(item).attr('href')


		setTimeout(()=>{
			console.log(`About to call "fetchNewsData again...`)
			fetchNewsData(nextUrl)
		}, 1000)

	
	})

	Promise.all(linkPromises).then((values) => {
		console.log('ALL link Promises have been resolved!')
	  })
	  .catch((error) => {
		console.log('OH OH, something failed in getting all link Promises resolved :(')
		console.error(error.message)
	  });

	console.log(`The total length of allDocuments array is: ${allDocuments.length}`)
	
	

	console.log('======== END fetchNewsData ========')

	return;

}

const allPagesPromises = fetchNewsData(entryPoint);

Promise.all(allPagesPromises).then((values) => {
	console.log(`===== EPIC WIN! "allPagesPromises" have been successfully resolved!!!`)
	})
  .catch((error) => {
	console.log(`OH OH, something failed in getting promises for "allPagesPromises"`)
	console.error(error.message)
  });

console.log(`======== The total length of allDocuments array is: ${allDocuments.length} =======`)
console.log(allDocuments)

// Function to convert array of objects to formatted CSV file
const writeToCsv = async (dataArr) => {
	const csv = new ObjectsToCsv(dataArr);

	// Save to file:
	await csv.toDisk('./archives/archives.csv');
}

// Function to slow down recursion
async function delay(timer) {
	setTimeout()
}

// Invoke function to output data to CSV after everything is done running
writeToCsv(allDocuments)