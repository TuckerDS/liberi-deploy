const eventModel = require('./eventModel.js');
const CATEGORIES = require('./categories');
const ObjectId = require('mongoose').Types.ObjectId;
const upload = require('../config/multer');

/**
 * eventController.js
 *
 * @description :: Server-side logic for managing events.
 */
module.exports = {

  //eventController.list()
  list: (req, res) => {
    eventModel.find((err, events) => {
      if (err) {
        return res.status(500).json({
          message: 'Error when getting event.',
          error: err
        });
      }
      return res.json(events);
    });
  },

  // eventController.filter()
  filter: (req, res) => {
    var category = req.params.category;

    eventModel.find({
      category: category
    }, (err, events) => {
      if (err) {
        return res.status(500).json({
          message: 'Error when getting events.',
          error: err
        });
      }
      if (!events) {
        return res.status(404).json({
          message: 'No such event'
        });
      }
      return res.json(events);
    });
  },

  // eventController.show()
  show: (req, res) => {
    var id = req.params.id;

    if(!ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Specified id is not valid' });
      return;
    }

    eventModel.findOne({
      _id: id
    }, (err, event) => {
      if (err) {
        return res.status(500).json({
          message: 'Error when getting event.',
          error: err
        });
      }
      if (!event) {
        return res.status(404).json({
          message: 'No such event'
        });
      }
      return res.json(event);
    });
  },

  //eventController.create()
  create: (req, res) => {
    var event = new eventModel({
      userId: new ObjectId(req.body.user_id),
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      permanent: req.body.permanent,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      picture: req.file ? `${req.file.filename}` : "ocio-madrid.jpg"
    });

    event.save((err, event) => {
      if (err) {
        return res.status(500).json({
          message: 'Error when creating event',
          error: err
        });
      }
      return res.status(201).json(event);
    });
  },

  //eventController.update()
  update: (req, res) => {
    var id = req.params.id;

    if(!ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Specified id is not valid' });
      return;
    }

    eventModel.findOne({
      _id: id
    }, (err, event) => {
      if (err) {
        return res.status(500).json({
          message: 'Error when getting event',
          error: err
        });
      }
      if (!event) {
        return res.status(404).json({
          message: 'No such event'
        });
      }

      event.title = req.body.title ? req.body.title : event.title;
      event.category = req.body.category ? req.body.category : event.category;
      event.description = req.body.description ? req.body.description : event.description;
      event.location = req.body.location ? req.body.location : event.location;
      event.permanent = req.body.permanent ? req.body.permanent : event.permanent;
      event.startDate = req.body.startDate ? req.body.startDate : event.startDate;
      event.endDate = req.body.endDate ? req.body.endDate : event.endDate;
      event.picture = req.file ? `${req.file.filename}` : event.picture;
      event.save((err, event) => {
        if (err) {
          return res.status(500).json({
            message: 'Error when updating event.',
            error: err
          });
        }
        return res.json(event);
      });
    });
  },

  //eventController.remove()
  remove: (req, res) => {
    var id = req.params.id;

    if(!ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Specified id is not valid' });
      return;
    }

    eventModel.findByIdAndRemove(id, (err, event) => {
      if (err) {
        return res.status(500).json({
          message: 'Error when deleting the event.',
          error: err
        });
      }
      return res.status(204).json();
    });
  }
};
