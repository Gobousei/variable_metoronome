//**用語解説：小節群・・・その関数で取り扱っている小節の集合で、速さや拍子などまとまりがあるもの */
//**セル・・・メトロノームとして使用している画面上部の並んだ四角形 */
const buttonStart = document.querySelector('#buttonStart')
const buttonStop = document.querySelector('#buttonStop')
const buttonReset = document.querySelector('#buttonReset')
const videoLive = document.querySelector('#videoLive')
const videoRecorded = document.querySelector('#videoRecorded')
const table = document.querySelector('#table').rows[0];
const downloadbutton = document.querySelector('#downroadbutton')
const text = document.querySelector('#text')
let array_location = -2;
const param = JSON.parse(location.href.split('=')[1]);
let memory;
var videodata;
table.width='100%';
buttonReset.style.display='none'
buttonStop.style.display='none'

  var ua = navigator.userAgent;//スマートフォンでの使用禁止
	if (ua.indexOf('iPhone') > 0
			|| (ua.indexOf('Android') > 0) && (ua.indexOf('Mobile') > 0)
			|| ua.indexOf('Windows Phone') > 0) {
        alert('このページはスマートフォンに対応していません。');
		}

async function main () {//**カメラの起動を含む常時起動関数 */
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true,
      audio: true,
    })
    videoLive.srcObject = stream
    if (!MediaRecorder.isTypeSupported('video/webm')) {
      console.warn('video/webm is not supported')
    }
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm',
    })
  
    buttonStart.addEventListener('click', () => {//**収録スタート */
      mediaRecorder.start();
      setting();
      buttonStart.style.display='none';
      buttonStop.style.display='block';
      buttonStart.setAttribute('disabled', '')
      buttonStop.removeAttribute('disabled')
    })
  
    buttonStop.addEventListener('click', () => {//**収録ストップ */
      mediaRecorder.stop();
      videoLive.style.display='none';
      buttonStop.style.display='none';
      videoRecorded.style.display='inline-block';
      buttonReset.style.display='inline-block';
      downroadbutton.style.display='inline-block';
      buttonStart.removeAttribute('disabled')
      buttonStop.setAttribute('disabled', '')
    })
  
    mediaRecorder.addEventListener('dataavailable', event => {//**再生 */
        videodata = event.data;
      videoRecorded.src = URL.createObjectURL(event.data);
    })

    downroadbutton.addEventListener('click',() => {//**動画のダウンロード */
      var url = window.URL.createObjectURL(videodata);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "rec.webm";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    })
  }

main()

function setting(){//設定の読み込みとカウントの開始
  array_location++;
    if(array_location == -1){//予備小節
      let bpm = param[0][0];
      let beats = param[0][1];
      memory = '演奏開始';
      count(bpm,'予備3小節',beats,3,'演奏',false);
    }else{//予備小節以降の設定
      let bpm = param[array_location][0];
      let display = memory;
      let beats = param[array_location][1];
      let measure = param[array_location][2];
      let fin;
      if(param.length == array_location+1){//次の配列がない場合、この小節群で終了する
        fin = true;
      }else{
        fin = false;
      }
      if(!fin){//この小節群が最後でないなら、次の小節群での変更点を記録する
        let next_location = array_location+1;
        switch(true){
          case param[array_location][0] != param[next_location][0]:
            memory = '♩='+param[next_location][0];
            break;
          case param[array_location][1] != param[next_location][1]:
            memory = param[next_location][1]+'拍子';
            break;
        }
      }else{
       memory = '演奏終了'; 
      }
  count(bpm,display,beats,measure,memory,fin);
    }
    
}

function count(bpm,display,beats,measure,next,fin){//カウント
  var ms = 60000/bpm; //繰り返し周期（ミリ秒）を設定
  let i= -1;

  setTimeout(function(){
    text.innerText = display;
    let balance_cell = beats - table.cells.length; //現在のセル数を取得し、セルの過不足を計算する
    console.log(balance_cell);
  if(balance_cell > 0){
    for(let c = 0; c<balance_cell;c++){
    table.insertCell(0);
    }
  }else if(balance_cell < 0){
    for(let c = 0; c<balance_cell*(-1);c++){
      table.deleteCell(0);
    }
  }
  },ms);
  
  
  let decell = beats-1;
  const timer = setInterval(function() {//カウントの本体、この部分を小節数分繰り返す
    i++;
    table.cells[i].style.backgroundColor = "yellow";//左のセルから順番に黄色にする
    if(i!=0){//一つ左のセルの色を白に戻す
      let h = i-1;
      table.cells[h].style.backgroundColor = "white";
    }
    switch (true){//特定の拍数の時のみに発動する処理
      case i==0://小節頭では一番右のセルを白色にする
        table.cells[decell].style.backgroundColor = "white";
      break;

      case i==decell://小節最後では拍数カウントをリセットし、小節数カウントを一つ減らす
        i=-1;
        measure--;
      break;
    }
    
    if(measure==1&&!fin){//次の小節群での変更点を表示する
      setTimeout(function(){text.innerText = '次の小節から'+next},ms);
    }
    if (measure <= 0) {//小節数カウントが0になったら
      clearInterval(timer);
      if(fin){//この小節群が最後の場合、演奏終了を表示する
      setTimeout(function(){text.innerText = '演奏終了'},ms);
      }else{//最後でないなら、次のカウントの読み込みを行う
      setting();
      }
    }
  }, ms);
}
