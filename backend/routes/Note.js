const express = require('express');
const router = express.Router();
const { isAuthenticatedUser } = require('../middlewares/auth');
const {
  createNote,
  getNotes,
  updateNote,
  deleteNote
} = require('../controllers/noteController');

router.route('/').get(isAuthenticatedUser, getNotes);
router.route('/').post(isAuthenticatedUser, createNote);
router.route('/:id').put(isAuthenticatedUser, updateNote);
router.route('/:id').delete(isAuthenticatedUser, deleteNote);

module.exports = router;
