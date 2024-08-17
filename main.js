
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
for(l=0;l<3;l++){
  table.cells[l].width= '333px';
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
    if(array_location == -1){
      let bpm = param[0][0];
      let beats = param[0][1];
      memory = '演奏開始';
      count(bpm,'予備3小節',beats,3,'次の小節から演奏',false);
    }else{
      let bpm = param[array_location][0];
      let display = memory;
      let beats = param[array_location][1];
      let measure = param[array_location][2];
      let fin;
      if(param.length == array_location+1){
        fin = true;
      }else{
        fin = false;
      }
      if(!fin){
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
    let balance_cell = beats - table.cells.length; //現在のセル数を取得し、必要なセル数に調整する
  if(balance_cell > 0){
    table.insertCell(balance_cell);
  }else if(balance_cell < 0){
    table.deleteCell(balance_cell);
  }
  table.width='100%';
  for(l=0;l<beats-1;l++){
    table.cells[l].width= 1000/beats+'px';
  }
  },ms);
  
  
  let decell = beats-1;
  const timer = setInterval(function() {
    i++;
    table.cells[i].style.backgroundColor = "yellow";
    if(i!=0){
      let h = i-1;
      table.cells[h].style.backgroundColor = "white";
    }
    switch (true){
      case i==0:
        table.cells[decell].style.backgroundColor = "white";
      break;

      case i==decell:
        i=-1;
        measure--;
      break;
    }
    
    if(measure==1){
      setTimeout(function(){text.innerText = '次の小節から'+next},ms);
    }
    if (measure <= 0) {
      clearInterval(timer);
      if(fin){
      setTimeout(function(){text.innerText = '演奏終了'},ms);
      }
      setting();
    }
  }, ms);
}
