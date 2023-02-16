const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let participantSchema = new Schema({
name: {
	type: String
},
email: {
	type: String
}
}, {
	collection: 'participants'
})

module.exports = mongoose.model('Participant', participantSchema)
