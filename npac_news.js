const axios = require('axios')
const cheerio = require('cheerio')
const ObjectsToCsv = require('objects-to-csv');


// Array of objects to store all data
// {
// 	title: Plain text string
// 	summary: Plain text string
// 	body: HTML String
// 	date: Plain text string
// 	url: Plain text string
// 	cta: Plain text string
// }
const allArticles = [];

axios
	.get('https://numberportability.com/news/')
	.then((response) => {
		const domString = response.data
		// console.log(domString)

		// Using Cheerio, we create a 'DOM' from the response string
		// (this will allow us to use the $ to act just like jQuery)
		const $ = cheerio.load(domString)
		const $articlesArr = $('.block-news .news-item')

		$articlesArr.each((index, item) => {

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

				console.log('Article has internal source... doing a secondary request to get full body HTML')

				// and if so, make a secondary request to get the full article's body
				axios.get(articleData.url)
					.then((response) => {
						const domString = response.data
						const $ = cheerio.load(domString)

						articleData.body = $('.container .rich-text').html()
						allArticles.push(articleData)

						console.log('This is the end of the road.')
					})
					.catch(function (error) {
						// handle error
						console.error(error);
					  })
			} else {
				console.log('Article points to external resource')
				allArticles.push(articleData)
			}
				
		})

		console.log(allArticles)

		// After we have finished looping over all found articles, we write all data to our CSV
		// console.log(allArticles)
		// If you use "await", code must be inside an asynchronous function:
		(async () => {
			const csv = new ObjectsToCsv(allArticles);

			console.log('Is this running here?')
		
			// Save to file:
			await csv.toDisk('./npac_news.csv');
		
			// Return the CSV file as string:
			console.log(await csv.toString());
		})();

	})
	.catch((error) => {
		console.error(error)
	});