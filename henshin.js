var ClickNum = 0;
var AutorizeNum = 0;

var isPushKey = false;
var isAuthorizable = false;
var onStandBy = false;
var onStandByMetal = false;
var onAuthorize = false;

var releaseCamera = true;

var srcsKey = new Array("picture/braveDragon_0p.png", "picture/braveDragon_1p.png", "picture/braveDragon_2p.png");
var srcsKeyLight = new Array("picture/braveDragon_0p.png", "picture/braveDragon_1p_light.png", "picture/braveDragon_2p_light.png");
//var mySwiper.realIndex = 0;

var threshold = 23;
//videoタグを取得
var video = document.getElementById("video");
//取得するメディア情報を指定
var medias = { audio: false, video: {} };

var mySwiper = new Swiper('.swiper-container', {
    loop: false,
});

function finishAudioLoading() {
    /*if (navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)) {
        medias.video.facingMode = { exact: "environment" };
    } else {*/
        medias.video.facingMode = { exact: "user" };
    //}

    document.getElementById("str").textContent = "environment";

    //getUserMediaを用いて、webカメラの映像を取得
    navigator.mediaDevices.getUserMedia(medias).then(
        function (stream) {
            //videoタグのソースにwebカメラの映像を指定
            video.srcObject = stream;

        }
    ).catch(
        function (err) {
            //カメラの許可がされなかった場合にエラー
            window.alert("not allowed to use camera");
        }
    );
}
var canvas = document.getElementById("canvas");
//ビデオのメタデータが読み込まれるまで待つ
video.addEventListener("loadedmetadata", function (e) {
    //canvasにカメラの映像のサイズを設定
    canvas.width = video.videoWidth/3;
    canvas.height = video.videoHeight/3;

    //getContextで描画先を取得
    var ctx = canvas.getContext("2d");
    //毎フレームの実行処理
    setInterval(function (e) {
        //console.log("releaseCamera:" + releaseCamera + "/" +"isAuthorizable:"+isAuthorizable);
        console.log(AutorizeNum);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        var imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = imagedata.data;
        var allPicColor = 0;
        for (var i = 0; i < canvas.height; i++) {
            for (var j = 0; j < canvas.width; j++) {
                var index = (i * canvas.width + j) * 4;
                //元のピクセルカラーを取得
                var r = data[index + 0];
                var g = data[index + 1];
                var b = data[index + 2];

                //RGBをグレースケールに変換
                var color = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
                data[index + 0] = color;
                data[index + 1] = color;
                data[index + 2] = color;
                allPicColor += color;
            }
        }
        var val = allPicColor / (canvas.height * canvas.width);
        JudgeAutorize(val);
        document.getElementById("debug").textContent = val;
        ctx.putImageData(imagedata, 0, 0, 0, 0, canvas.width, canvas.height);
    }, 33);
        

});


function JudgeAutorize(value) {
    if (value < threshold) {
        if (!onAuthorize) {
            onAuthorize = true;
            ringByCamera(1);
            document.getElementById("debug_bool").textContent = "true";
        }
 
    }
    else {
        if (onAuthorize) {
            onAuthorize = false;
            //if (AutorizeNum == 3) playSEMoveLever(onAuthorize);
            ringByCamera(2);
            document.getElementById("debug_bool").textContent = "false";
        }
       
    }
    
}

// ========================================
// 効果音を鳴らす（★今回のメインはこれ★）
// ========================================
function ring() {
    isAuthorizable = true;
    if (false) {
        playSECallKey(1)
    } else {
        AutorizeNum = 1;
        document.getElementById("key").src = srcsKey[0];
        document.getElementById("key_light").src = srcsKeyLight[0];
        playSECallKey(0);
        SEstandbyStop();
    }
}


function ringByCamera(callNum) {
    console.log(callNum + ";" + AutorizeNum);
    var isRing = false;
    var waitTime = 3000;
    if (!isAuthorizable) return;

    if (callNum == 1 && AutorizeNum == 2) {
        waitTime = 1000;
        isRing = true;
        onStandBy = true;
        //releaseCamera = false;
        document.getElementById("key").src = srcsKey[1];
        document.getElementById("key_light").src = srcsKeyLight[1];
        playSECallKey(1);
     }
    if (callNum == 2) {
        isRing = true;
        if (onStandBy) SEstandbyStop();
        if(AutorizeNum == 1) {
            waitTime = 1500;
            isRing = true;
            onStandBy = true;
            //releaseCamera = false;
            document.getElementById("key").src = srcsKey[1];
            document.getElementById("key_light").src = srcsKeyLight[1];
            playSEBelt(mySwiper.realIndex);
         }
        else if (AutorizeNum == 3) {
                waitTime = 2500;
                playSECallFunction(mySwiper.realIndex);
                document.getElementById("key").src = srcsKey[2];
            document.getElementById("key_light").src = srcsKeyLight[2];
        }
        else if (AutorizeNum == 3) {
            //必殺技
            /*
            waitTime = 2500;
            playSECallFinish(mySwiper.realIndex);
            */
        }
    }
    if (isRing) {
        isAuthorizable = false;
        setTimeout(function () {
            if (AutorizeNum == 2||AutorizeNum==3) isAuthorizable = true;
        }, waitTime)

        if (AutorizeNum < 3)AutorizeNum++;
    }
}



function SEstandbyStop() {
    
    //SE_authorize.pause();
    //SE_authorize.currentTime = 0;
    //SE_progrise.pause();
    //SE_progrise.currentTime = 0;
    onStandBy = false;
    onStandByMetal = false;
    
    stopSE();
    stopStandbySE();
    stopStandbyLetsRise();
    
}


//-----------------------------------------------------------

