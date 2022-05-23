"use strict";

(function () {
    // 直接返回new好的实例
    function Sign(targetId) {
        // 我们new的其实是Sign.fn.init
        return new Sign.fn.init(targetId);
    }

    // sign.fn其实就是sign的原型，算是个简写，所有实例都会拥有这上面的方法
    Sign.fn = Sign.prototype = {
        // 设置颜色
        color: function (color = '#000') {
            this.penColor = color
            return this
        },
        size: function (size = 5) {
            this.penSize = size
            return this
        },
        smooth: function (smoothLevel = 0) {
            // this.smoothLevel = smoothLevel
            this.smoothSwitch = true
            return this
        }
    };

    // 构造函数
    Sign.fn.init = function (targetId) {
        this.penColor = "#000000"
        this.penSize = 5

        this.penTouchDown = false

        this.deviceIsMobile = /mobile/i.test(navigator.userAgent)

        this.targetDom = Sign.initCanvas(targetId);

        //
        this.smoothSwitch = false

        // 
        this.evDownTmp = Sign.mouseDown.bind(this)
        this.evUpTmp = Sign.mouseUp.bind(this)
        this.evMoveTmp = Sign.mouseMove.bind(this)

        //
        this.pathArray = []

    };

    Sign.initCanvas = function (targetId) {
        return document.querySelector(targetId)
    }

    // 前面new的是init，返回的是init的实例
    // 为了让返回的实例能够访问到sign的方法，将init的原型指向sign的原型
    Sign.fn.init.prototype = Sign.fn;

    // 添加实例方法
    Sign.fn.open = function (params) {
        const canvas = document.createElement('canvas')
        canvas.height = this.targetDom.clientHeight
        canvas.width = this.targetDom.clientWidth
        canvas.id = "singCanvas"

        this.targetDom.innerHTML = ""

        this.targetDom.appendChild(canvas)

        this.ctx = canvas.getContext('2d')
        this.ctx.strokeStyle = this.penColor
        this.ctx.fillStyle = this.penColor

        this.ctx.lineWidth = this.penSize
        this.ctx.lineCap = "round";

        this.canvas = canvas

        Sign.eventListen(this)

        if (this.pathArray.length > 0) {
            Sign.recurrent(this)
        }

        return this
    }
    // 关闭
    Sign.fn.close = function (isClear = true) {
        console.log('close');
        if (isClear) {
            this.pathArray = []
        }
        Sign.removeEvent(this)
        this.canvas = null
        return this
    }
    // 保存为图片
    Sign.fn.saveToIMG = function (suffix = 'png', name = 'sign') {
        let imgData = this.canvas.toDataURL(suffix)
        let fixtype = function (type) {
            type = type.toLocaleLowerCase().replace(/jpg/i, 'jpeg');
            let r = type.match(/png|jpeg|bmp|gif/)[0];
            return 'image/' + r;
        }
        imgData = imgData.replace(fixtype(suffix), 'image/octet-stream')

        let saveFile = function (data, filename) {
            let link = document.createElement('a');
            link.href = data;
            link.setAttribute('download', filename)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
        let filename = name + '.' + suffix;
        saveFile(imgData, filename);
        return this
    }
    // 保存为URL
    Sign.fn.saveToURL = function (params) {
        return this.canvas.toDataURL('png')
    }
    // 撤销
    Sign.fn.revoke = function (params) {
        if (this.pathArray.length > 0) {
            this.pathArray.splice(this.pathArray.length - 1, 1)
            Sign.recurrent(this)
        }
    }
    // 清空
    Sign.fn.clearPath = function () {
        this.pathArray = []
        Sign.recurrent(this)
    }
    Sign.fn.clear = function () {
        this.ctx.clearRect(0, 0, this.targetDom.clientWidth, this.targetDom.clientHeight)
    }
    // 添加静态方法
    Sign.eventListen = function (_this) {
        _this.canvas.addEventListener(_this.deviceIsMobile ? 'touchstart' : 'mousedown', _this.evDownTmp)
        _this.canvas.addEventListener(_this.deviceIsMobile ? 'touchend' : 'mouseup', _this.evUpTmp)
        _this.canvas.addEventListener(_this.deviceIsMobile ? 'touchmove' : 'mousemove', _this.evMoveTmp)
    }
    Sign.removeEvent = function (_this) {
        _this.canvas.removeEventListener(_this.deviceIsMobile ? 'touchstart' : 'mousedown', _this.evDownTmp)
        _this.canvas.removeEventListener(_this.deviceIsMobile ? 'touchend' : 'mouseup', _this.evUpTmp)
        _this.canvas.removeEventListener(_this.deviceIsMobile ? 'touchmove' : 'mousemove', _this.evMoveTmp)
    }
    Sign.mouseDown = function (e) {
        this.penTouchDown = true
        // console.log(e.touches[0]);
        const vote = {
            x: this.deviceIsMobile ? e.changedTouches[0].clientX : e.offsetX,
            y: this.deviceIsMobile ? e.changedTouches[0].clientY : e.offsetY
        }
        this.pathArray.push([vote])
        this.ctx.beginPath()
        this.ctx.arc(vote.x, vote.y, this.penSize / 2, 0, 2 * Math.PI)
        this.ctx.fill()
        this.ctx.beginPath()
    }
    Sign.mouseUp = function (e) {
        this.penTouchDown = false
        if (this.smoothSwitch) {
            Sign.smooth(this)
        }
    }
    Sign.mouseMove = function (e) {
        if (this.penTouchDown) {
            // console.log(e.touches[0]);
            const vote = {
                x: this.deviceIsMobile ? e.changedTouches[0].clientX : e.offsetX,
                y: this.deviceIsMobile ? e.changedTouches[0].clientY : e.offsetY
            }

            const lastPoint = this.pathArray[this.pathArray.length - 1]
            if (lastPoint.length === 1) {
                this.ctx.lineTo(lastPoint[0].x, lastPoint[0].y)
            }

            this.pathArray[this.pathArray.length - 1].push(vote)

            this.ctx.lineTo(vote.x, vote.y)
            this.ctx.stroke();

            e.preventDefault()
        }
    }

    Sign.recurrent = function (_this) {
        _this.clear()
        let len = _this.pathArray.length
        for (let i = 0; i < len; i++) {
            _this.ctx.beginPath()
            let cLen = _this.pathArray[i].length
            for (let j = 0; j < cLen; j++) {
                _this.ctx.lineTo(_this.pathArray[i][j].x, _this.pathArray[i][j].y)
            }
            _this.ctx.stroke();
        }
    }

    Sign.smooth = function (_this) {
        // const audioContext = new AudioContext()
        // const filterSignal = function (signal, type, bufferSize = 256) {
        //     const node = audioContext.createBufferSource()
        //     const buffer = audioContext.createBuffer(1, signal.length, audioContext.sampleRate)
        //     const data = buffer.getChannelData(0)
        //     const processed = []

        //     const filter = audioContext.createBiquadFilter()
        //     filter.type = type
        //     filter.frequency.value = _this.smoothLevel * 1000

        //     const processorNode = audioContext.createScriptProcessor(bufferSize, 2, 2)

        //     const signalLen = signal.length

        //     const promise = new Promise((resolve, reject) => {
        //         processorNode.onaudioprocess = (ev) => {
        //             const inputBuffer = ev.inputBuffer
        //             const inputData = inputBuffer.getChannelData(0)
        //             const len = inputData.length

        //             for (let sample = 0; sample < len; sample++) {
        //                 processed.push(inputData[sample])
        //             }

        //             if (processed.length >= signalLen) {
        //                 processorNode.disconnect()
        //                 resolve(processed)
        //             }
        //         }
        //     })

        //     for (let i = 0; i < signalLen; i++) {
        //         data[i] = signal[i]
        //     }

        //     node.buffer = buffer
        //     node.connect(filter)
        //     filter.connect(processorNode)
        //     processorNode.connect(audioContext.destination)
        //     node.start(audioContext.currentTime)

        //     return promise
        // }

        let smoothArr = _this.pathArray[_this.pathArray.length - 1]
        // let smoothObj = {
        //     x: smoothArr.map(foo => foo.x),
        //     y: smoothArr.map(foo => foo.y)
        // }
        let smoothArrLen = smoothArr.length
        // let bufferSize = smoothArrLen > 256 ? (smoothArrLen > 0) && ((smoothArrLen & (smoothArrLen - 1)) == 0) ? smoothArrLen : 256 : 256
        // console.log(smoothObj);

        // Promise.all([
        //     filterSignal(smoothObj.x, 'lowpass', bufferSize),
        //     filterSignal(smoothObj.y, 'lowpass', bufferSize)
        // ]).then(res => {
        //     res[0].length = smoothArrLen
        //     res[1].length = smoothArrLen
        //     // console.log(res)

        //     _this.pathArray.splice(_this.pathArray.length - 1, 1)

        //     let vote = []
        //     let len = res[0].length
        //     for (let i = 6; i < len; i++) {
        //         let foo = {
        //             x: res[0][i],
        //             y: res[1][i]
        //         }
        //         vote.push(foo)
        //     }

        //     _this.pathArray.push(vote)
        //     Sign.recurrent(_this)
        // })

        if (smoothArrLen > 1 && _this.smoothSwitch) {
            let newPnts = []
            newPnts.push({ x: smoothArr[0].x, y: smoothArr[0].y })
            for (let n = 0; n < smoothArrLen; n++) {
                if (n <= smoothArrLen - 4) {
                    for (let t = 0.0; t <= 1; t += 0.1) {
                        let a1 = Math.pow((1 - t), 3) / 6;
                        let a2 = (3 * Math.pow(t, 3) - 6 * Math.pow(t, 2) + 4) / 6;
                        let a3 = (-3 * Math.pow(t, 3) + 3 * Math.pow(t, 2) + 3 * t + 1) / 6;
                        let a4 = Math.pow(t, 3) / 6;

                        let x = a1 * smoothArr[n].x + a2 * smoothArr[n + 1].x + a3 * smoothArr[n + 2].x + a4 * smoothArr[n + 3].x;
                        let y = a1 * smoothArr[n].y + a2 * smoothArr[n + 1].y + a3 * smoothArr[n + 2].y + a4 * smoothArr[n + 3].y;
                        newPnts.push({ x: x, y: y });
                    }
                }
            }
            newPnts.push({ x: smoothArr[smoothArrLen - 1].x, y: smoothArr[smoothArrLen - 1].y })
            _this.pathArray.splice(_this.pathArray.length - 1, 1)
            _this.pathArray.push(newPnts)
            Sign.recurrent(_this)
        }

    }


    module.exports = Sign
})()
