const axios = require('axios')
const cheerio = require('cheerio')
const fs = require("fs");
const ObjectsToCsv = require('objects-to-csv');


// Sample data - two columns, three rows:
const articlesData = [
  	{
		title: 'Spotting Imposters: Are your customers who they say they are?',
  		summary: 'On this episode of the American Bankers Association podcast, iconectiv’s Kathy Timko, Head of LNPA Services, joins Paul Benda of the American Bankers Association to discuss the rising trend of phone number account takeover and how it enables identity theft and fraud. Kathy oversees all aspects of iconectiv’s U.S. number portability business, which includes managing the Number Portability Administration Center (NPAC), a system that supports number portability services for all telecom service providers including wireline, wireless and Voice over IP (VoIP) providers.',
		body: '',
		date: '11/18/2020',
		url: 'https://www.aba.com/news-research/podcasts/spotting-imposters-are-your-customers-who-they-say-they-are',
		link_text: 'Read Full Article'
	},
	{
		title: 'Status Update: Local Number Portability Administrator Contract',
  		summary: 'On this episode of the American Bankers Association podcast, iconectiv’s Kathy Timko, Head of LNPA Services, joins Paul Benda of the American Bankers Association to discuss the rising trend of phone number account takeover and how it enables identity theft and fraud. Kathy oversees all aspects of iconectiv’s U.S. number portability business, which includes managing the Number Portability Administration Center (NPAC), a system that supports number portability services for all telecom service providers including wireline, wireless and Voice over IP (VoIP) providers.',
		body: '<div class="rich-text"><h2>Status Update: Local Number Portability Administrator Contract</h2><p><b>Background:</b>&nbsp;The FCC’s “local number portability” system allows consumers and businesses to keep their phone number when switching providers, which supports consumer choice and competition in the communications market. The transfer or “porting” of numbers between carriers is done by a neutral third party called the Local Number Portability Administrator (LNPA). Number portability costs are paid for by the industry. The current LNPA’s contract automatically renews for one-year terms and the next available termination date is June 30, 2015. The FCC is overseeing the process to select the next LNPA. Maintaining the integrity and availability of the porting system is paramount.&nbsp;</p><p><b>The Action:</b>&nbsp;Today, the Wireline Competition Bureau is circulating a draft order to the full Commission, which, if adopted, would initiate contract negotiations with Telcordia (d/b/a iconectiv) to serve as the next LNPA. Telcordia has extensive experience in numbering administration in the U.S. and abroad. The North American Numbering Council (NANC) – a Federal Advisory Committee created to advise the Commission on numbering issues – and the Commission staff evaluated the bids for technical and managerial competence, security considerations, and cost-effectiveness. The draft includes provisions to ensure a smooth transition and to protect the integrity and availability of the system during and after the transition.&nbsp;</p><p><b>Role of the LNPA:</b>&nbsp;The LNPA develops, maintains and operates the processes and database used to “port” or transfer numbers. The LNPA also provides services to law enforcement and public safety organizations.&nbsp;</p><p><b>Reason for the Action:</b>&nbsp;Neustar (or its predecessor-in-interest) has been the LNPA since 1997. Neustar provides service under a contract with an industry group, North American Portability Management LLC (NAPM:&nbsp;<a href="http://bit.ly/17RekCN" target="_blank">http://bit.ly/17RekCN</a>), which recommended using a competitive process (<a href="http://bit.ly/1Nh05I4" target="_blank">http://bit.ly/1Nh05I4</a>) to select the next LNPA.&nbsp;</p><p><b>The Process:</b>&nbsp;The process to select the next LNPA has been progressing since 2011.&nbsp;</p><p></p><ul><li>In March and May 2011, after providing notice and receiving comment, the Wireline Competition Bureau issued two orders (DA 11-454 (<a href="http://bit.ly/1Kkcpsf" target="_blank">http://bit.ly/1Kkcpsf</a>) and DA 11-883 (<a href="http://bit.ly/1B2j4RK" target="_blank">http://bit.ly/1B2j4RK</a>) setting out the selection process. &nbsp;</li><li>In February 2013, after providing notice and receiving comment (<a href="http://bit.ly/18PTzIY" target="_blank">http://bit.ly/18PTzIY</a>), the NAPM issued a Request for Proposals and other bid documents (<a href="http://bit.ly/1B7eUGS" target="_blank">http://bit.ly/1B7eUGS</a>).</li><li>Between April 2013 and April 2014, the NAPM and the Commission’s Federal Advisory Committee, called the North American Numbering Council or NANC, conducted an extensive review of the bids, and each bidder was allowed to submit a “best and final offer” (<a href="http://bit.ly/1wIhbK4" target="_blank">http://bit.ly/1wIhbK4</a>).</li><li>In April 2014 the NANC submitted to the Commission its unanimous recommendation (<a href="http://bit.ly/1Nh0H0u" target="_blank">http://bit.ly/1Nh0H0u</a>) to select Telcordia as the next LNPA.</li><li>In June 2014, the Commission sought public comment (<a href="http://bit.ly/1ENJh81" target="_blank">http://bit.ly/1ENJh81</a>) on the NANC’s recommendation (<a href="http://bit.ly/1Nh0H0u" target="_blank">http://bit.ly/1Nh0H0u</a>), allowing more than two months (<a href="http://bit.ly/1zKhGxV" target="_blank">http://bit.ly/1zKhGxV</a>) for responses to give all parties time to evaluate the recommendation.&nbsp;</li><li>FCC staff independently reviewed and corroborated the NANC recommendation and analysis. Staff worked closely with law enforcement and national security experts outside of the FCC to ensure that security and reliability issues are addressed.&nbsp;</li><li>The draft order takes into account the NANC recommendation, input from many interested parties, and Telcordia’s experience administering sensitive numbering systems in the U.S. and abroad. The Commission will coordinate with other federal agencies and ensure that any final contract includes provisions to protect national security.&nbsp;</li></ul><b>Next Steps:</b>&nbsp;If the Commission adopts the draft order, the NAPM would begin to negotiate contract terms with Telcordia. These terms would be subject to approval by the FCC’s Wireline Competition Bureau. If a final contract is negotiated, then the Commission would oversee the transition to ensure that matters affecting the public interest, such as public safety and security, are fully addressed in the contract terms, and to ensure that any transition occurs efficiently and seamlessly.&nbsp;</div>',
		date: '03/04/2015',
		url: '',
		link_text: 'Read Full Article'
	},
];
 
// If you use "await", code must be inside an asynchronous function:
(async () => {
  const csv = new ObjectsToCsv(articlesData);
 
  // Save to file:
  await csv.toDisk('./test.csv');
 
  // Return the CSV file as string:
  console.log(await csv.toString());
})();


axios
	.get('https://numberportability.com/news/')
	.then((response) => {
		const domString = response.data
		// console.log(domString)

		// Using Cheerio, we create a 'DOM' from the response string
		// (this will allow us to use the $ to act just like jQuery)
		const $ = cheerio.load(domString)
		const pageTitle = $('.header-text-container h1').text();
		console.log(`The pageTitle is: ${pageTitle}`)
	})
	.catch((error) => {
		console.error(error)
	});