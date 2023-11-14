const { default: mongoose } = require('mongoose');
const path = require('path');
const {places, descriptors} = require('./seedHelpers');
const cities = require('./cities');
const Campground = require('../models/campground');


mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db= mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDb = async () => {
    await Campground.deleteMany({});
    for(let i=0;i<300;i++)
    {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20)+10;
        const camp = new Campground({
            author : '6544b886781785907c06b01e',
            location : `${cities[random1000].city}, ${cities[random1000].state} `,
            title : `${sample(descriptors)} ${sample(places)} `,
            description: "this is my campground description",
            geometry: { 
                type: 'Point', 
                coordinates: [ cities[random1000].longitude, cities[random1000].latitude ] 
            },
            price,
            images: [
                {
                  url: 'https://res.cloudinary.com/dj0ye57kn/image/upload/v1699208430/YelpCamp/w1pjcpx2qpmm23zrpgct.jpg',
                  filename: 'YelpCamp/w1pjcpx2qpmm23zrpgct',
                },
                {
                  url: 'https://res.cloudinary.com/dj0ye57kn/image/upload/v1699208430/YelpCamp/t9mz47zymcqsv1prg9r9.jpg',
                  filename: 'YelpCamp/t9mz47zymcqsv1prg9r9',
                }
              ],
        });
        await camp.save();
    }
    
} 
seedDb().then(()=>{
    mongoose.connection.close()
});