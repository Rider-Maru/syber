var ClickNum = 0;
var AutorizeNum = 0;

var isPushKey = false;
var isAuthorizable = false;
var onStandBy = false;
var onStandByMetal = false;
var onAuthorize = false;

var releaseCamera = true;

var srcsKey = new Array("picture/key_awaking_arsino.png", "picture/key_amazing_caucasus.png");
var srcsKeyLight = new Array("picture/key_awaking_arsino_light.png", "picture/key_amazing_caucasus_light.png");
//var mySwiper.realIndex = 0;

var threshold = 23;
//videoタグを取得
var videoFront = document.getElementById("videoFront");
var videoBack = document.getElementById("videoBack");
//取得するメディア情報を指定
var mediasFront = { audio: false, video: {} };
var mediasBack = { audio: false, video: {} };
var mySwiper = new Swiper('.swiper-container', {
    loop: true,
});

function finishAudioLoading() {
        mediasBack.videoBack.facingMode = { exact: "environment" };
        mediasFront.videoFront.facingMode = { exact: "user" };

    document.getElementById("str").textContent = "environment";

    //getUserMediaを用いて、webカメラの映像を取得
    navigator.mediaDevices.getUserMedia(mediasFront).then(
        function (stream) {
            //videoタグのソースにwebカメラの映像を指定
            videoFront.srcObject = stream;
        }
    ).catch(
        function (err) {
            //カメラの許可がされなかった場合にエラー
            window.alert("not allowed to use camera");
        }
    );
    navigator.mediaDevices.getUserMedia(mediasBack).then(
        function (stream) {
            //videoタグのソースにwebカメラの映像を指定
            videoBack.srcObject = stream;
        }
    ).catch(
        function (err) {
            //カメラの許可がされなかった場合にエラー
            window.alert("not allowed to use camera");
        }
    );
}
var canvasFront = document.getElementById("canvasFront");
var canvasBack = document.getElementById("canvasBack");
//ビデオのメタデータが読み込まれるまで待つ
videoBack.addEventListener("loadedmetadata", function (e) {
    //canvasにカメラの映像のサイズを設定
    canvasBack.width = videoBack.videoWidth/3;
    canvasBack.height = videoBack.videoHeight/3;

    //getContextで描画先を取得
    var ctx = canvasBack.getContext("2d");
    //毎フレームの実行処理
    setInterval(function (e) {
        //console.log("releaseCamera:" + releaseCamera + "/" +"isAuthorizable:"+isAuthorizable);
        ctx.drawImage(videoBack, 0, 0, canvasBack.width, canvasBack.height);
        var imagedata = ctx.getImageData(0, 0, canvasBack.width, canvasBack.height);
        var data = imagedata.data;
        var allPicColor = 0;
        for (var i = 0; i < canvasBack.height; i++) {
            for (var j = 0; j < canvasBack.width; j++) {
                var index = (i * canvasBack.width + j) * 4;
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
        var val = allPicColor / (canvasBack.height * canvasBack.width);
        JudgeAutorize(val);
        document.getElementById("debug").textContent = val;
        ctx.putImageData(imagedata, 0, 0, 0, 0, canvasBack.width, canvasBack.height);
    }, 33);
});
videoFront.addEventListener("loadedmetadata", function (e) {
    //canvasにカメラの映像のサイズを設定
    canvasFront.width = videoFront.videoWidth/3;
    canvasFront.height = videoFront.videoHeight/3;

    //getContextで描画先を取得
    var ctx = canvasFront.getContext("2d");
    //毎フレームの実行処理
    setInterval(function (e) {
        //console.log("releaseCamera:" + releaseCamera + "/" +"isAuthorizable:"+isAuthorizable);
        ctx.drawImage(videoFront, 0, 0, canvasFront.width, canvasFront.height);
        var imagedata = ctx.getImageData(0, 0, canvasFront.width, canvasFront.height);
        var data = imagedata.data;
        var allPicColor = 0;
        for (var i = 0; i < canvasFront.height; i++) {
            for (var j = 0; j < canvasFront.width; j++) {
                var index = (i * canvasFront.width + j) * 4;
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
        var val = allPicColor / (canvasFront.height * canvasFront.width);
        JudgeAutorize(val);
        document.getElementById("debug2").textContent = val;
        ctx.putImageData(imagedata, 0, 0, 0, 0, canvasFront.width, canvasFront.height);
    }, 33);
});


function JudgeAutorize(value) {
    console.log(value);
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
    if (AutorizeNum == 2) {
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

    if (callNum == 1 && AutorizeNum == 1) {
        waitTime = 3000;
        isRing = true;
        onStandBy = true;
        //releaseCamera = false;
        document.getElementById("key").src = srcsKey[1];
        document.getElementById("key_light").src = srcsKeyLight[1];
        playSEBelt(mySwiper.realIndex);
     }
    else if (callNum == 2) {
        isRing = true;
        if (onStandBy) SEstandbyStop();
        if (AutorizeNum == 2) {
                waitTime = 2500;
                playSECallFunction(mySwiper.realIndex);
        }
        else if (AutorizeNum == 3) {
            waitTime = 2500;
            playSECallFinish(mySwiper.realIndex);
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

