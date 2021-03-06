const Tweet = require('./../db/models').Tweet;
const TwitterAccount = require('./../db/models').TwitterAccount;
const Team = require('./../db/models').Team;
const { Op } = require('sequelize');
const db = require('./../db/models');

module.exports = {
  findAll: async (req, res) => {
    try {
      const payload = await Tweet.findAll({
        include: [
          {
            model: TwitterAccount,
            as: 'twitterAccount',
            include: { model: Team, as: 'team' }
          }
        ],
        order: [['publishedDate', 'DESC']]
      });

      return res.status(200).send({ payload });
    } catch (error) {
      return res.status(500).send({
        payload: [],
        message: error.message || 'There was an error fetching tweets.'
      });
    }
  },

  findAllByFavoriteTeams: async (req, res) => {
    try {
      const payload = await Tweet.findAll({
        include: [
          {
            model: TwitterAccount,
            as: 'twitterAccount',
            include: { model: Team, as: 'team' }
          }
        ],
        order: [['publishedDate', 'DESC']],
        where: { id: req.body.ids }
      });

      return res.status(200).send({ payload });
    } catch (error) {
      return res.status(500).send({
        payload: [],
        message: error.message || 'There was an error fetching tweets.'
      });
    }
  },

  findAllByPaginated: async (req, res) => {
    try {
      const {
        body: { page = 0, size = 10 }
      } = req;

      const offset = page * size;
      const limit = size;

      const payload = await Tweet.findAll({
        include: [
          {
            model: TwitterAccount,
            as: 'twitterAccount',
            include: { model: Team, as: 'team' }
          }
        ],
        order: [['publishedDate', 'DESC']],
        offset,
        limit
      });

      return res.status(200).send({ payload });
    } catch (error) {
      return res.status(500).send({
        payload: [],
        message: error.message || 'There was an error fetching articles.'
      });
    }
  },

  findAllByTeamId: async (req, res) => {
    try {
      const payload = await Tweet.findAll({
        include: [
          {
            model: TwitterAccount,
            as: 'twitterAccount',
            where: { teamId: req.params.id },
            include: { model: Team, as: 'team' }
          }
        ],
        order: [['publishedDate', 'DESC']]
      });

      return res.status(200).send({ payload });
    } catch (error) {
      return res.status(500).send({
        payload: [],
        message: error.message || 'There was an error fetching tweets.'
      });
    }
  },

  findByLastDay: async (req, res) => {
    try {
      const payload = await Tweet.findAll({
        include: [
          { model: TwitterAccount, as: 'twitterAccount', include: { model: Team, as: 'team' } }
        ],
        where: {
          publishedDate: {
            [Op.gte]: db.sequelize.literal("NOW() - INTERVAL '1d'")
          }
        },
        order: [['publishedDate', 'DESC']]
      });

      return res.status(200).send({ payload });
    } catch (error) {
      return res.status(500).send({
        payload: [],
        message: error.message || 'There was an error fetching tweets.'
      });
    }
  },

  findByLatest: async (req, res) => {
    try {
      const payload = await Tweet.findAll({
        include: [
          { model: TwitterAccount, as: 'twitterAccount', include: { model: Team, as: 'team' } }
        ],
        order: [['publishedDate', 'DESC']],
        limit: 20
      });

      return res.status(200).send({ payload });
    } catch (error) {
      return res.status(500).send({
        payload: [],
        message: error.message || 'There was an error fetching tweets.'
      });
    }
  },

  findLatestByFavoriteTeams: async (req, res) => {
    try {
      const payload = await Tweet.findAll({
        include: [
          {
            model: TwitterAccount,
            as: 'twitterAccount',
            include: { model: Team, as: 'team' },
            where: { teamId: req.body.ids }
          }
        ],
        order: [['publishedDate', 'DESC']],
        limit: 20
      });

      return res.status(200).send({ payload });
    } catch (error) {
      return res.status(500).send({
        payload: [],
        message: error.message || 'There was an error fetching tweets.'
      });
    }
  }
};
