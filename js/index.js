
function getQueryStringObject() {
    var a = window.location.search.substr(1).split('&');
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i) {
        var p = a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
}

var qs = getQueryStringObject()
var audio = qs.a
var pdf = qs.p

addEventListener("DOMContentLoaded", (event) => {
    if (!audio) {
        document.querySelector('#player-box').innerHTML = "<div class='justText'>https://player.peacht.art/<span>?a={audio-url}&p={pdf-url}</span></div><div class='justText'>위 URL로 접속하시면 온라인상의 아무 음원(일단 미스키 드라이브에 있는 건 가능)이나 플레이어로 감싸서 + 악보와 함께 듣거나 공유하실 수 있습니다.</div>"
    } else if (audio) {
        var isPlaying = false
        var isLoop = true
        var volume = 1;
        document.querySelector('body').addEventListener("click", function () {
            if (!document.querySelector("audio")) {

                document.querySelector("#player-box").innerHTML = '<audio style="display:none;" ><source src="'+audio+'" /></audio><div id="playbar"><div id="playTime"></div><div><input type="range" id="duration" class="rangeInput" name="duration" min="0" max="100" value="0" /></div><div id="totTime"></div></div><div id="player"><div class="playButton"><i class="bx bx-play" ></i></div><div class="stopButton"><i class="bx bx-stop" ></i></div><div class="loopButton"><i class="bx bx-x-circle" ></i></div><div><label for="volume"><i class="bx bxs-megaphone" ></i> </label><input type="range" class="rangeInput" id="volume" name="volume" min="0" max="100" value="100" /></div></div></div>'
                var audioplayer = document.querySelector("audio")
                audioplayer.loop = isLoop
                audioplayer.volume = volume
                audioplayer.play()
                isPlaying = true

                const timeAudio = () => {
                    const duration = audioplayer.duration || 0;
                    const timeBar = document.querySelector('#duration')
                    const totTime = document.querySelector('#totTime')
                    const playTime = document.querySelector('#playTime')
                    const tick = duration / 100
                    //전체시간 표시
                    // 음원 총 <i class='bx bx-play' ></i>시간 구하기
                    const min = Math.floor(duration / 60);
                    const sec = Math.floor(duration % 60);
                    const totMin = min.toString().padStart(2, "0");
                    const totSec = sec.toString().padStart(2, "0");
                    totTime.innerText = `${totMin}:${totSec}`

                    // 현재시간 표시
                    audioplayer.addEventListener("timeupdate", (event) => {
                        //const playTime = $(".current");
                        let ctTime = parseInt(audioplayer.currentTime / tick)
                        // 프로그레스 바 업데이트
                        timeBar.value = `${ctTime}`

                        let min = Math.floor(ctTime / 60);
                        let sec = Math.floor(ctTime % 60);
                        let ctMin = min.toString().padStart(2, "0");
                        let ctSec = sec.toString().padStart(2, "0");
                        playTime.innerText = `${ctMin}:${ctSec}`
                    })

                    timeBar.addEventListener("change", (event) => {
                        audioplayer.currentTime = parseInt(event.target.value)*tick
                    });
                }

                audioplayer.onloadeddata = function(){
                    timeAudio(); 
                }

                document.querySelector(".playButton").innerHTML = "<i class='bx bx-pause'></i>"
                
                document.querySelector(".playButton").addEventListener("click", function () {
                    if (isPlaying) {
                        audioplayer.pause()
                        document.querySelector(".playButton").innerHTML = "<i class='bx bx-play' ></i>"
                        isPlaying = false
                    } else {
                        audioplayer.play()
                        document.querySelector(".playButton").innerHTML = "<i class='bx bx-pause'></i>"
                        isPlaying = true
                    }
                })
        
                document.querySelector(".stopButton").addEventListener("click", function () {
                    if (isPlaying) {
                        audioplayer.pause()
                        audioplayer.currentTime = 0;
                        document.querySelector(".playButton").innerHTML = "<i class='bx bx-play' ></i>"
                        isPlaying = false
                    }
                })

                document.querySelector(".loopButton").addEventListener("click", function () {
                    if (isLoop) {
                        isLoop = false
                        audioplayer.loop = isLoop
                        document.querySelector(".loopButton").innerHTML = "<i class='bx bx-revision' ></i>"
                    } else {
                        isLoop = true
                        audioplayer.loop = isLoop
                        document.querySelector(".loopButton").innerHTML = "<i class='bx bx-x-circle' ></i>"
                    }
                })
    
                document.querySelector("#volume").addEventListener("change", (event) => {
                    audioplayer.volume = parseInt(event.target.value)/100
                });
            }
            
        })
    }
    if (pdf) { 
        document.querySelector('#pdf-box').innerHTML = '<embed class="pdf" src="'+pdf+'" type="application/pdf" />'
    }
})