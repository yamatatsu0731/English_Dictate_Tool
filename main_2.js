/* Class Define */
class Word{
	constructor(content, correct){
		this._content = content;
		this._correct = correct;
		this._isCorrect = false;
	}
	
	set Content(content){
		this._content = content;
	}
	get Content(){
		return this._content;
	}
	
	set Correct(correct){
		this._correct = correct;
	}
	get Correct(){
		return this._correct;
	}
	
	Check(){
		if(this._content.trim().toLowerCase() == this._correct.toLowerCase()){
			this._isCorrect = true;
			return true;
		}
		else{
			this._isCorrect = false;
			return false;
		}
	}
}

class Sentence{
	constructor(rawWords, endmark){
		this._words = new Array();
		for(var i in rawWords){
			this._words.push(new Word('', rawWords[i]));
		}
		this._endmark = endmark;
	}
	
	set EndMark(mark){
		this._endmark = mark;
	}
	get EndMark(){
		return this._endmark;
	}
	
	get Words(){
		return this._words;
	}
	
	static IsAllowedEndMark(mark){
		if(mark == '.' || mark == '!' || mark == '?')
			return true;
		else
			return false;
	}
}

class AudioController{
	constructor(sourceUri){
		this._sourceUri = sourceUri;
		this._audioInstance = new Audio(sourceUri);
		this._isInPlay = false;
	}
	
	Load(uri){
		this._sourceUri = uri;
		this._audioInstance = new Audio(uri);
	}
	
	Play(){
		this._audioInstance.play();
		this._isInPlay = true;
	}
	
	Pause(){
		this._audioInstance.pause();
		this._isInPlay = false;
	}
	
	Stop(){
		this._audioInstance.stop();
		this._isInPlay = false;
	}
	
	SwitchPlayPause(){
		if(this._isInPlay)
			this.Pause();
		else
			this.Play();
	}
	
	Rewind(sec){
		this._audioInstance.currentTime -= sec;
	}
	
	Forward(sec){
		this._audioInstance.currentTime += sec;
	}
	
	RewindToTop(){
		this._audioInstance.currentTime = 0;
	}
	
	get IsInPlay(){
		return this._isInPlay;
	}
}

class DictateController{
	constructor(audioSourceUri){
		this._nowSentence = 0;
		this._nowWord = 0;
		this._sentences = "";
		this._isPressedShift = false;
		this._isPressedCtrl = false;
		this._isPressedTabRecently = false;
		
		this._audioController = new AudioController(audioSourceUri);		
	}
	
	get Sentences(){
		return this._sentences;
	}
	
	get NowSentence(){
		return this._sentences[this._nowSentence]
	}
	
	get NowWord(){
		return this._sentences[this._nowSentence].Words[this._nowWord];
	}
	
	get AudioCtrlr(){
		return this._audioController;
	}
	
	static load(){
		
	}
	
	save(){
		var saves = window.JSON.stringify(this);
		window.localStorage.setItem('ctrlr', saves);
	}
	
	focusNextField(){
		this._nowWord++;
		if(this.NowSentence.length <= this._nowWord){
			this._nowWord = 0;
			this._nowSentence++;
			if(this._sentences.length <= this._nowSentence){
				this._nowWord = 0;
				this._nowSentence = 0;
			}
		}
		
		var nextElem = $('#' + this._nowSentence + '-' + this._nowWord);
		nextElem.focus();
		nextElem.select();
	}
	
	focusPrevField(){	
		this._nowWord--;
		if(this._nowWord < 0){
			this._nowSentence--;
			if(this._nowSentence < 0){
				this._nowWord = 0;
				this._nowSentence = 0;
			}
			else{
				this._nowWord = this.NowSentence.length;
			}
		}		
		var prevElem = $('#' + this._nowSentence + '-' + this._nowWord);
		prevElem.focus();
		prevElem.select();
	}
	
	createInputField(sentences){
		$('#right_content').empty();
		
		this._formatText(sentences);
		if(!this.NowWord.Content)
			this._sentences.pop();
		
		for(var i in this._sentences){
			var elem = '<div style="margin:0;">';
			for(var j in this._sentences[i].Words){
				var id = i + '-' + j;
				elem += '<input onclick="onWordfieldClick(this)" onkeydown="onWordFieldKeyDown(arguments[0]);" onkeyup="onWordFieldKeyUp();" id="' + id + '" type="text" style="width:9em;font-family:inherit;font-size:1em;margin:5px;border-color:black;border-width:0 0 1px 0;text-align:center" />'
			}
			elem += '<span style="font-weight:bold">.</span></div><br><br>';
			$('#right_content').append(elem);
		}
	}
	
	checkAnswerOf(sentenceId){
		for(var i = 0; i < this._sentences[sentenceId].Words.length; i++){
			var objElem = $('#' + sentenceId + '-' + i);
			var answer = objElem.val().toLowerCase();
			if(this._sentences[sentenceId].Words[i].Check())
				objElem.css('background-color', '#CEF6CE');
			else{
				objElem.css('background-color', '#FE2E2E');
				var hoverTimer;
				var thisObj = this;
				objElem.on('mouseover', function(e){
					var elems = this.id.split('-');
					var sentenceId = parseInt(elems[0]);
					var wordId = parseInt(elems[1]);
					hoverTimer = setTimeout(function(){
						var correct = thisObj._sentences[sentenceId].Words[wordId].Correct;
						$('#correct').text(correct).css('top', e.pageY).css('left', e.pageX).css('display', 'block');
					}, 800);
				});
				objElem.on('mouseout', function(){
					clearTimeout(hoverTimer);
					$('#correct').css('display', 'none');
				});
			}
		}	
	}
	
	changeField(sentenceId, wordId){
		this._nowSentence = sentenceId;
		this._nowWord = wordId;
	}
	
	changeTxtNowInput(){
		var input = $('#' + this._nowSentence + '-' + this._nowWord).val();
		this.NowWord.Content = input;
	}
	
	checkAnswerAll(){
		for(var i in textSource)
			checkAnswerOf(i);
	}
	
	onPressedEnter(e){
		this.AudioCtrlr.SwitchPlayPause();
	}
	
	onPressedShift(e){
		this._isPressedShift = true;
	}
	
	onUnPressedShift(e){
		this._isPressedShift = false;
	}
	
	onPressedCtrl(e){
		this._isPressedCtrl = true;
	}
	
	onUnPressedCtrl(e){
		this._isPressedCtrl = false;
	}
	
	onPressedSpace(e){
		if(this._isPressedShift)
			this.focusPrevField();
		else
			this.focusNextField();
	}
	
	onPressedTab(e){
		if(this._isPressedTabRecently){
			clearTimeout(this._tabTimer);
			this._isPressedTabRecently = false;
			this.AudioCtrlr.Rewind(1);
		}
		else{
			this._isPressedTabRecently = true;
			this._tabTimer = setTimeout(function(){
				this._isPressedTabRecently = false;
				this.AudioCtrlr.Rewind(5);
			}, 250);
		}
	}
	
	onPressedA(e){
		if(this._isPressedCtrl){
			e.preventDefault();
			if(this._isPressedShift)
				this.checkAnswerAll();
			else
				this.checkAnswerOf(this._nowSentence);
		}
	}
	
	onPressedS(e){
		if(this._isPressedCtrl){
			e.preventDefault();
			this.save();
		}		
	}
	
	_formatText(text){
		var replaced = text.replace('!', '!.').replace('?', '?.').replace(/["“”‘’#$%&()\*\+\-,\/:;<=>@\[\\\]^_`{|}~—]/g, '').replace(/’/g, "'");
		var splited = replaced.split(/[.]\s|[.]\n+/);
		this._sentences = new Array();
		for(var i in splited){
			var rawWords = splited[i].trim().split(' ');
			var lastWord = rawWords[rawWords.length - 1];
			if(Sentence.IsAllowedEndMark(lastWord))
				rawWords[rawWords.length - 1] = lastWord.replace(lastWord, '');
			this._sentences.push(new Sentence(rawWords, lastWord));
		}
	}
}

var ctrlr = false;
function isBetween(val, start, end){
	if(start <= val && val <= end)
		return true;
	else
		return false;
}

function onWordFieldKeyDown(e){
	if(isBetween(e.keyCode, 65, 90))
		return;
	else if(isBetween(e.keyCode, 48, 57))
		return;
	else if(e.keyCode == 8 || e.keyCode == 46)
		return;
	else if(isBetween(e.keyCode, 37, 40))
		return;
	else
		e.preventDefault();
}
function onWordFieldKeyUp(e){
	ctrlr.changeTxtNowInput();
}
	
function onWordfieldClick(e){
	var elems = e.id.split('-');
	var sentenceId = elems[0];
	var wordId = elems[1];
	ctrlr.changeField(sentenceId, wordId);
}


$(document).ready(function(){
	$('#audio_box').css('display', 'block');
	$('#audio_box').animate({
		opacity: 1
	}, 1000);
	
	var tabTimer;
	$('#right_content').on('keydown', function(e){
		switch(e.keyCode){
			case 13:	// enter key
				ctrlr.onPressedEnter(e);
				break;
			case 16:	// shift key
				ctrlr.onPressedShift(e);
				break;
			case 17:	// ctrl key
				ctrlr.onPressedCtrl(e);
				break;
			case 32:	// space key
				ctrlr.onPressedSpace(e);
				break;
			case 9:
				ctrlr.onPressedTab(e);
				break;
			case 65:	// a key
				ctrlr.onPressedA(e);
				break;
			case 83:	// s key
				ctrlr.onPressedS(e);
				break;
			default:
				break;
		}
	});
	
	$(document).on('keyup', function(e){
		switch(e.keyCode){
			case 16:	// shift key
				ctrlr.onUnPressedShift();
				break;
			case 17:	// ctrl key
				ctrlr.onUnPressedCtrl();
				break;
			default:
				break;
		}
	});
	
	$('#audio_input').on('change', function(){
		var src = $(this).val();
		ctrlr = new DictateController(src);

		$('#text_box').css('display', 'block').animate({
			'opacity': 1,
			'margin-top': '20px'
		}, 1000);
	});
	
	var isDisplayedTxt = false;
	$('#text_box .title').on('click', function(){
		if(isDisplayedTxt){
			$('#text_input').css('display', 'block').css('padding', '20px').animate({
				height: '0'
			}, 300, 'linear', function(){
				$('#text_input').css('display', 'none').css('padding', '0').css('border-width', 0);
			});
			isDisplayedTxt = false;
		}
		else {
			$('#text_input').css('display', 'block').css('padding', '20px').animate({
				height: '300px'
			}, 300);
			isDisplayedTxt = true;
		}
	});
	
	$('#text_input').on('change', function(){
		var sentences = $(this).val();
		if(!sentences)
			return;
			
		$('#text_input').animate({
			height: 0
		}, 300, 'linear', function(){
			isDisplayedTxt = false;
			$('#text_input').css('display', 'none').css('padding', '0').css('border-width', 0);
			$('#explanation_box').css('display', 'block').animate({
				'opacity': 1,
				'margin-top': '20px'
			}, 1000, 'linear', function(){
				ctrlr.createInputField(sentences);
			});
			
		});
	});
	
	var isDisplayedExp = false;
	$('#explanation_box .title').on('click', function(){
		if(isDisplayedExp){
			$('#explanation').animate({
				'height': '0'
			}, 300);
			isDisplayedExp = false;
		}
		else {
			$('#explanation').animate({
				'height': '140px'
			}, 300);
			isDisplayedExp = true;
		}
	});
	
	$('#save_box .title').on('click', function(){
		save();
	});
});

