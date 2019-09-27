
var nowSentence = 0;
var nowWord = 0;

function isBetween(val, start, end){
	if(start <= val && val <= end)
		return true;
	else
		return false;
}

function onWordfieldChange(e){
	if(isBetween(e.keyCode, 65, 90))
		return;
	else if(isBetween(e.keyCode, 48, 57))
		return;
	else if(e.keyCode == 8)
		return;
	else
		e.preventDefault();
}
function onWordfieldClick(e){
	var elems = e.id.split('-');
	var sentenceId = elems[0];
	var wordId = elems[1];
	nowSentence = sentenceId;
	nowWord = wordId;
}

$(document).ready(function(){
	$('#audio_box').css('display', 'block');
	$('#audio_box').animate({
		opacity: 1
	}, 1000);
	var audioSource = document.getElementById('audio_source');
	var isInPlay = false;
	var textSource = new Array();
	var isDisplayedCorrect = true;
	var isPressedCtrl = false;
	var isPressedShift = false;
	var isPressedTabRecently = false;
	var isInit = true;
	
	// 再生・一時停止の切り替え
	function switchPlayMode(){
		if(isInPlay){
			audioSource.pause();
			isInPlay = false;
		}else {
			audioSource.play();
			isInPlay = true;
		}
	}

	// 巻き戻し
	function rewind(time){
		audioSource.currentTime -= time;
	}
	// 早送り
	function forward(time){
		audioSource.currentTime += time;
	}
	// 最初から再生
	function rewindTop(){
		audioSource.currentTime = 0;
	}
	
	// テキストフィールドの表示をスイッチ
	function switchTextField(){
		if(isDisplayedCorrect){
			$('#text_input').css('color', 'white');
			isDisplayedCorrect = false;
		}
		else{
			$('#text_input').css('color', 'black');
			isDisplayedCorrect = true;
		}
	}
	
	// 次の入力フォームへフォーカス
	function focusNextField(){
		nowWord++;
		if(textSource[nowSentence].length <= nowWord){
			nowWord = 0;
			nowSentence++;
			if(textSource.length <= nowSentence){
				nowWord = 0;
				nowSentence = 0;
			}
		}
		
		var nextElem = $('#' + nowSentence + '-' + nowWord);
		nextElem.focus();
		nextElem.select();
	}
	
	// 前の入力フォームへフォーカス
	function focusPrevField(){
		if(isInit){
			$('#save_box').animate({
				'opacity': 1,
				'margin-top': '20px'
			}, 1000);
		}
		
		nowWord--;
		if(nowWord < 0){
			nowSentence--;
			if(nowSentence < 0){
				nowWord = 0;
				nowSentence = 0;
			}
			else{
				nowWord = textSource[nowSentence].length;
			}
		}
		
		var prevElem = $('#' + nowSentence + '-' + nowWord);
		prevElem.focus();
		prevElem.select();
	}
	
	// 渡されたテキストを単語ごとの2次元配列にして返す
	function formatText(text){
		var replaced = text.replace(/([!]|[?])/g, '.').replace(/["“”‘’#$%&()\*\+\-,\/:;<=>@\[\\\]^_`{|}~—]/g, '').replace(/’/g, "'");
		var splited = replaced.split(/[.]\s|[.]\n+/);
		for(i in splited){
			splited[i] = splited[i].trim();
			var words = splited[i].split(' ');
			splited[i] = words;
		}
		var lastWdLen = splited[splited.length - 1].length;
		splited[splited.length - 1][lastWdLen - 1] = splited[splited.length - 1][lastWdLen - 1].replace('.', '');
		
		return splited;
	}
	
	// 入力されたテキストをもとに空欄を作成する
	function createInputField(sentences){
		$('#right_content').empty();
		// 段落ごとに配列に格納
		textSource = formatText(sentences);
		
		if(!textSource[textSource.length - 1][0])
			textSource.pop();
		
		for(i in textSource){
			var elem = '<div style="margin:0;">';
			for(j in textSource[i]){
				var id = i + '-' + j;
				elem += '<input onclick="onWordfieldClick(this)" onkeydown="onWordfieldChange(arguments[0]);" id="' + id + '" type="text" style="width:9em;font-family:inherit;font-size:1em;margin:5px;border-color:black;border-width:0 0 1px 0;text-align:center" />'
			}
			elem += '<span style="font-weight:bold">.</span></div><br><br>';
			$('#right_content').append(elem);
		}
	}
	
	// 答え合わせ
	function checkAnswerOf(sentenceId){
		for(var i = 0; i < textSource[sentenceId].length; i++){
			var objElem = $('#' + sentenceId + '-' + i);
			var answer = objElem.val().toLowerCase();
			var correct = textSource[sentenceId][i].toLowerCase();
			if(answer == correct)
				objElem.css('background-color', '#CEF6CE')
			else{
				objElem.css('background-color', '#FE2E2E');
				var hoverTimer;
				objElem.on('mouseover', function(e){
					var elems = this.id.split('-');
					var sentenceId = parseInt(elems[0]);
					var wordId = parseInt(elems[1]);
					hoverTimer = setTimeout(function(){
						var correct = textSource[sentenceId][wordId];
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
	
	function checkAnswerAll(){
		for(var i in textSource)
			checkAnswerOf(i);
	}
	
	// 保存
	function save(){
		
	}
	
	var tabTimer;
	$('#right_content').on('keydown', function(e){
		switch(e.keyCode){
			case 13:	// enter key
				switchPlayMode();
				break;
			case 16:	// shift key
				isPressedShift = true;
			case 17:	// ctrl key
				isPressedCtrl = true;
				break;
			case 32:	// space key
				if(isPressedShift)
					focusPrevField();
				else
					focusNextField();
				break;
			case 9:
			case 37:	// tab, ←
				if(isPressedTabRecently){
					clearTimeout(tabTimer);
					isPressedTabRecently = false;
					rewind(1);
				}
				else{
					isPressedTabRecently = true;
					tabTimer = setTimeout(function(){
						isPressedTabRecently = false;
						rewind(5);
					}, 250);
				}
				break;
			case 38:	// ↑
				rewindTop();
				break;
			case 39:	// →
				forward(5);
				break;
			case 65:	// a key
				if(isPressedCtrl){
					e.preventDefault();
					if(isPressedShift)
						checkAnswerAll();
					else
						checkAnswerOf(nowSentence);
				}
				break;
			default:
				break;
		}
	});
	
	$(document).on('keyup', function(e){
		switch(e.keyCode){
			case 16:	// shift key
				isPressedShift = false;
				break;
			case 17:	// ctrl key
				isPressedCtrl = false;
				break;
			default:
				break;
		}
	});
	
	$('#audio_input').on('change', function(){
		audioSource.src = $(this).val();

		$('#text_box').css('display', 'block').animate({
			'opacity': 1,
			'margin-top': '20px'
		}, 1000)
		
		//$(this).blur();
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
				createInputField(sentences);
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

