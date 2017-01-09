var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var creditsSchema = mongoose.Schema({
	clickCont       : {type: String, required: true, trim: true},
    bannerId        : {type: String, required: true, trim: true},
    data 			: {type: Date, default: Date.now}

});

var UserCreditsSchema = new Schema({
    username       	: {type: String, required: true, trim: true, unique: true},
    credits        	: [creditsSchema]]
});
module.exports = mongoose.model('UserCredits', UserCreditsSchema);
