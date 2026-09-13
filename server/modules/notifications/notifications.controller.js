// server/modules/notifications/notifications.controller.js
const notificationsService = require('./notifications.service');
const { successResponse } = require('../../../shared/schemas/apiResponse');
const { Errors } = require('../../middleware/errorHandler');

async function getNotifications(req, res, next) {
  try {
    const notifications = await notificationsService.getNotificationsForUser(req.user.itsNumber);
    return res.status(200).json(successResponse({ notifications }));
  } catch (err) {
    return next(err);
  }
}

async function getUnreadCount(req, res, next) {
  try {
    const count = await notificationsService.getUnreadCount(req.user.itsNumber);
    return res.status(200).json(successResponse({ count }));
  } catch (err) {
    return next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) {
      throw Errors.validationFailed('A valid integer notification id is required in the URL.');
    }
    const result = await notificationsService.markAsRead(id, req.user.itsNumber);
    return res.status(200).json(successResponse(result));
  } catch (err) {
    return next(err);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    const result = await notificationsService.markAllAsRead(req.user.itsNumber);
    return res.status(200).json(successResponse(result));
  } catch (err) {
    return next(err);
  }
}

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead };