var AWS = require('aws-sdk');
var nodemailer = require('nodemailer');
//var dynamodb = new AWS.DynamoDB();

const responseHeaders = {
	'Content-Type': 'application/json',
	// Required for CORS support to work
	'Access-Control-Allow-Origin': '*',
	// Required for cookies, authorization headers with HTTPS
	'Access-Control-Allow-Credentials': true
}

const responses = {
	success: (data = {}, code = 200) => {
		return {
			'statusCode': code,
			'headers': responseHeaders,
			'body': JSON.stringify(data)
		}
	},
	error: (error) => {
		return {
			'statusCode': error.code || 500,
			'headers': responseHeaders,
			'body': JSON.stringify(error)
		}
	}
}

var company1;

AWS.config.update({ region: "us-east-2" });
const documentclient = new AWS.DynamoDB.DocumentClient({ region: "us-east-2" });
exports.handler = (event, context, callback) => {
	console.log(event.queryStringParameters.searchText);


	getFromDynamo(event.queryStringParameters.searchText, callback);
}
function getFromDynamo(text, callback) {
	/*
	   var params = {
	   ExpressionAttributeValues: {
	   ":SQR": {
		 S: "qwertyuiop"
		}
	  }, 
	  FilterExpression: "stringQR = :SQR",
	  TableName: "companyQuestions"
	 };
	 
	 */
	var params = {
		TableName: "companyQuestions",
		FilterExpression: "stringQR=:SQR",
		ExpressionAttributeValues: {
			":SQR": "qwertyuiop"
		}
	};

	documentclient.scan(params, function (err, data) {
		if (err) console.log(err);// an error occurred 
		else console.log(data.Items);
		//console.log(AWS.DynamoDB.Converter.unmarshall(data.Items));
		this.company1 = data.Items;
		console.log(this.company1);
		var speechRes = matchTags(text, data.Items);
		callback(null, responses.success(speechRes))

	});
}

var stop_words = ["a", "about", "above", "across", "after", "afterwards", "again", "against", "all", "almost", "alone", "along", "already", "also", "although", "always", "am", "among", "amongst", "amount", "an", "and", "another", "any", "anyhow", "anyone", "anything", "anyway", "anywhere", "are", "around", "as", "at", "back", "be", "became", "because", "become", "becomes", "becoming", "been", "before", "beforehand", "behind", "being", "below", "beside", "besides", "between", "beyond", "both", "bottom", "but", "by", "call", "can", "cannot", "ca", "could", "did", "do", "does", "doing", "done", "down", "due", "during", "each", "eight", "either", "eleven", "else", "elsewhere", "empty", "enough", "even", "ever", "every", "everyone", "everything", "everywhere", "except", "few", "fifteen", "fifty", "first", "five", "for", "former", "formerly", "forty", "four", "from", "front", "full", "further", "get", "give", "go", "had", "has", "have", "he", "hence", "her", "here", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "him", "himself", "his", "however", "hundred", "i", "if", "in", "indeed", "into", "is", "it", "its", "itself", "keep", "last", "latter", "latterly", "least", "less", "just", "made", "to", "many", "may", "me", "meanwhile", "might", "mine", "more", "moreover", "most", "mostly", "move", "much", "must", "my", "myself", "name", "namely", "neither", "never", "nevertheless", "next", "nine", "no", "nobody", "none", "noone", "nor", "not", "nothing", "now", "nowhere", "of", "off", "often", "on", "once", "one", "only", "onto", "or", "other", "others", "otherwise", "our", "ours", "ourselves", "out", "over", "own", "part", "per", "perhaps", "please", "put", "quite", "rather", "re", "really", "regarding", "same", "say", "see", "seem", "seemed", "seeming", "seems", "serious", "several", "she", "should", "show", "side", "since", "six", "sixty", "so", "some", "somehow", "someone", "something", "sometime", "sometimes", "somewhere", "still", "such", "take", "ten", "than", "that", "the", "their", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "therefore", "therein", "thereupon", "these", "they", "third", "this", "those", "though", "three", "through", "throughout", "thru", "thus", "together", "too", "top", "toward", "towards", "twelve", "twenty", "two", "under", "until", "up", "unless", "upon", "us", "used", "using", "various", "very", "very", "via", "was", "we", "well", "were", "whatever", "when", "whence", "whenever", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "whoever", "whole", "whom", "whose", "why", "will", "with", "within", "without", "would", "yet", "you", "your", "yours", "yourself", "yourselves", "you're", "you've", "you'll", "you'd", "she's", "that'll", "it's", "should've", "don't", "wouldn't", "weren't", "won't", "shouldn't", "wasn't", "shan't", "needn't", "mustn't", "mightn't", "isn't", "haven't", "hasn't", "hadn't", "doesn't", "didn't", "couldn't", "aren't", "aint"];

//makes minimalistic tag arrayfrom string
function tagMaker(str) {

	//removing all except alphabet & numeric and removes underscore
	str = str.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");
	//splits sentences into lower case words
	var res_str = str.toLowerCase().split(" ");
	var array_difference = [];
	// difference will contain duplicates
	var array_difference = res_str.filter(function (x) {
		if (stop_words.indexOf(x) == -1)
			return true;
		else
			return false;
	});
	// create Set to eliminate duplicates
	// convert Set to array using spread
	var result = [...new Set(array_difference)];
	return result;
}

//Mailer function
var mailIt = function (txt) {

	//mail configurations
	var send_mail = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			type: 'login',
			user: 'cse.14bcs1578@gmail.com',
			pass: 'EscapeDeath'
		}
	});

	//mail contents
	var mail = {
		from: 'cse.14bcs1578@gmail.com',
		to: 'krsjha@yahoo.com',
		subject: "Service Request",
		text: txt
	};

	//node mailer function to send mail
	send_mail.sendMail(mail, function (err, info) {
		if (err) {
			console.log(err);
			return "mail couldn't be sent";
		}
		else {
			console.log("Mail Sent.");
			return "Mail Sent.";
		}
	});

}

// creates tags of our question and logs highest match percentage and answer
var matchTags = function (qstr, data) {

	this.company1 = data;

	var ansTags = [];
	var ansTagArr = [];
	var array_intersection = [];
	var matchPer = 0;
	var highestMatchPer = 0;
	var highestMatchPerIndex = -1;

	//makes tags from question string
	var qtag = tagMaker(qstr);
	console.log(qtag);

	for (var i = 0; i < qtag.length; i++) {

		//for how questions
		if (qtag[i] == "how") {

			//fetches question array of {questions answers tags} for how
			ansTagArr = this.company1[0].questions.how;
			console.log(ansTagArr);

			//traverses through questions in array 
			for (var j = 0; j < ansTagArr.length; j++) {

				//fetches tag array of individual elements in how
				ansTags = ansTagArr[j].tags;

				//finds common tags between questions and answer 
				array_intersection = ansTags.filter(function (x) {
					if (qtag.indexOf(x) != -1)
						return true;
					else
						return false;
				});

				//finds match percentage between question and answer
				matchPer = array_intersection.length * 100 / (qtag.length - 1);

				//finds highest match Percentage and corresponding index
				if (matchPer > highestMatchPer) {
					highestMatchPer = matchPer;
					highestMatchPerIndex = j;
				}
			}
			//prints answers for highest match
			console.log("Answer to highest match is ");
			console.log(ansTagArr[highestMatchPerIndex].answer);
			//logging highest match Percentage
			console.log("Respective percentage match is ");
			console.log(highestMatchPer);
			return ansTagArr[highestMatchPerIndex].answer;
		}

		//for what questions 
		else if (qtag[i] == "what") {
			console.log(this.company1.questions)
			ansTagArr = this.company1[0].questions.what;
			console.log(ansTagArr);
			for (var j = 0; j < ansTagArr.length; j++) {
				ansTags = ansTagArr[j].tags;
				array_intersection = ansTags.filter(function (x) {
					if (qtag.indexOf(x) != -1)
						return true;
					else
						return false;
				});
				matchPer = array_intersection.length * 100 / (qtag.length - 1);
				if (matchPer > highestMatchPer) {
					highestMatchPer = matchPer;
					highestMatchPerIndex = j;
				}
			}
			console.log("Answer to highest match is ");
			console.log(ansTagArr[highestMatchPerIndex].answer);

			console.log("Respective percentage match is ");
			console.log(highestMatchPer);
			return ansTagArr[highestMatchPerIndex].answer;
		}

		//for where questions
		else if (qtag[i] == "where") {
			ansTagArr = this.company1[0].questions.where;
			console.log(ansTagArr);
			for (var j = 0; j < ansTagArr.length; j++) {
				ansTags = ansTagArr[j].tags;
				array_intersection = ansTags.filter(function (x) {
					if (qtag.indexOf(x) != -1)
						return true;
					else
						return false;
				});
				matchPer = array_intersection.length * 100 / (qtag.length - 1);
				if (matchPer > highestMatchPer) {
					highestMatchPer = matchPer;
					highestMatchPerIndex = j;
				}
			}
			console.log("Answer to highest match is ");
			console.log(ansTagArr[highestMatchPerIndex].answer);

			console.log("Respective percentage match is ");
			console.log(highestMatchPer);
			return ansTagArr[highestMatchPerIndex].answer;
		}
		//for action commands
		else if (qtag[i] == "please") {

			var stxt;
			console.log(qstr);
			//Mail content
			stxt = qstr + "\n\n\nRegards,\n" + company1.companyName;
			var resp = mailIt(stxt);
			console.log("Trying to send mail to receptionist");
			return resp;
		}

		//if nothing matches
		else {
			var err = "Sorry No match Found!\n Can you please try again. ";
			console.log(err);
			return err;
		}
	}
}

