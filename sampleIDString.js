module.exports = {
	sampleIDString: function(id){
		let s = String(id).padStart(6, '0');

		return s;
	}
}