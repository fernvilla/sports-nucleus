require('dotenv').config();

const sendErrorEmail = require('../utils/emails').sendErrorEmail;
const YoutubeAccount = require('./../db/models').YoutubeAccount;
const YoutubeVideo = require('./../db/models').YoutubeVideo;
const db = require('./../db/models');
const fetch = require('isomorphic-unfetch');
const differenceInDays = require('date-fns').differenceInDays;
const Entities = require('html-entities').AllHtmlEntities;

const entities = new Entities();

(async () => {
  try {
    await db.sequelize.authenticate();

    const accounts = await YoutubeAccount.findAll();

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const startDateString = encodeURIComponent(startDate.toISOString());

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const endDateString = encodeURIComponent(endDate.toISOString());

    const fetchAndMapVideos = async account => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${account.channelId}&order=date&publishedAfter=${startDateString}&publishedBefore=${endDateString}&type=video&key=${process.env.YOUTUBE_API_KEY}`
        );
        const data = await res.json();

        const createVideo = async video => {
          const { id, snippet } = video;

          const publishedDate = snippet.publishedAt || new Date();

          if (differenceInDays(new Date(publishedDate), new Date()) < -1) return;

          const newVideo = {
            title: entities.decode(snippet.title),
            youtubeAccountId: account.id,
            publishedDate,
            videoId: id.videoId,
            description: entities.decode(snippet.description),
            thumbnail: snippet.thumbnails.high.url
          };

          const [dbVideo, created] = await YoutubeVideo.findCreateFind({
            where: { videoId: newVideo.videoId },
            defaults: newVideo
          });

          if (created) console.log('video created', dbVideo.title);
        };

        await Promise.all(data.items.map(createVideo));
      } catch (err) {
        return err;
      }
    };

    await Promise.all(accounts.map(account => fetchAndMapVideos(account)));

    db.sequelize.close();
  } catch (err) {
    console.error('main fetch tweets error(s)', err);
    sendErrorEmail('Fetch Videos error', { err });
    db.sequelize.close();
  }
})();
