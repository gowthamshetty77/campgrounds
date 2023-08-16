const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/yc');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i=0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
          //YOUR USER ID
            author: '64887c63f2f25545b6e5e826',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            // image: 'https://source.unsplash.com/collection/256524',
            // image: 'https://unsplash.com/collections/2525098',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
            price,
            geometry: {
              type: "Point",
              coordinates: [
                  cities[random1000].longitude,
                  cities[random1000].latitude,
              ]
            },
            images: [
              {
                url: 'https://res.cloudinary.com/dnr3hnenc/image/upload/v1691981998/YelpCamp/aedbdsfcxwja3xhccgjp.jpg',
                filename: 'YelpCamp/aedbdsfcxwja3xhccgjp'
              },
              {
                url: 'https://res.cloudinary.com/dnr3hnenc/image/upload/v1691981999/YelpCamp/oqvgmvhwfynxobworxj9.jpg',
                filename: 'YelpCamp/oqvgmvhwfynxobworxj9'
              }
            ]
            
            
            // images: [
            //     {
            //       url: 'https://res.cloudinary.com/dnr3hnenc/image/upload/v1689336305/YelpCamp/owtnxcvhsz0lxxionznd.avif',
            //       filename: 'YelpCamp/owtnxcvhsz0lxxionznd',
            //     },
            //     {
            //       url: 'https://res.cloudinary.com/dnr3hnenc/image/upload/v1689336307/YelpCamp/ovrndtdnssurljvu2hka.jpg',
            //       filename: 'YelpCamp/ovrndtdnssurljvu2hka',
            //     }
            //   ]           
        })
        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close();
});