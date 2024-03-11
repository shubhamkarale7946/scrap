const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const app = express();

const url = 'https://news.ycombinator.com/';

app.get('/', async (req, res) => {
    try {
        // Fetching the HTML content of the Hacker News homepage
        const response = await axios.get(url);
        const html = response.data;

        // Parsing the HTML content using Cheerio
        const $ = cheerio.load(html);

        // Array to store news items
        const newsItems = [];

        // Extracting relevant information for each news item
        $('tr.athing').each((index, element) => {
            const title = $(element).find('.title a').text();
            const link = $(element).find('.title a').attr('href');
            const commentCount = parseInt($(element).next().find('.subtext a:nth-last-child(1)').text().split(' ')[0]) || 0;

            newsItems.push({ title, link, commentCount });
        });

        // Grouping news items based on comment count ranges
        const groupedNewsItems = {
            '[0-100]': newsItems.filter(item => item.commentCount >= 0 && item.commentCount <= 100),
            '[101-200]': newsItems.filter(item => item.commentCount >= 101 && item.commentCount <= 200),
            '[201-300]': newsItems.filter(item => item.commentCount >= 201 && item.commentCount <= 300),
            '[301-n]': newsItems.filter(item => item.commentCount >= 301)
        };

        // Writing grouped news items to a JSON file
        fs.writeFileSync('hacker_news.json', JSON.stringify(groupedNewsItems, null, 2));

        res.json(groupedNewsItems);
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).send('An error occurred while processing your request.');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
