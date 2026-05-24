/*
    This script is not my own codes.
    References from 
        https://stackoverflow.com/questions/30110701/how-can-i-use-js-webaudioapi-for-beat-detection
            Posted by Etheryte, modified by community. See post 'Timeline' for change history
            Retrieved 2026-05-24, License - CC BY-SA 4.0
        http://joesul.li/van/beat-detection-using-web-audio/
            There is no license mention.
*/

/** Detect song's bpm (Promise) */
function detectBpm(audioURL) {
    return new Promise((resolve, reject) => {
        function prepare(buffer) {
            var offlineContext = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);
            var source = offlineContext.createBufferSource();
            source.buffer = buffer;
            var filter = offlineContext.createBiquadFilter();
            filter.type = "lowpass";
            source.connect(filter);
            filter.connect(offlineContext.destination);
            source.start(0);
            offlineContext.startRendering();
            offlineContext.oncomplete = function(e) {
                process(e);
            };
        }
        
        function process(e) {
            var filteredBuffer = e.renderedBuffer;
            //If you want to analyze both channels, use the other channel later
            var data = filteredBuffer.getChannelData(0);
            var max = arrayMax(data);
            var min = arrayMin(data);
            var threshold = min + (max - min) * 0.98;
            var peaks = getPeaksAtThreshold(data, threshold);
            var intervalCounts = countIntervalsBetweenNearbyPeaks(peaks);
            var tempoCounts = groupNeighborsByTempo(intervalCounts);
            tempoCounts.sort(function(a, b) {
                return b.count - a.count;
            });
            if (tempoCounts.length) {
                // output.innerHTML = tempoCounts[0].tempo;
                resolve(tempoCounts[0].tempo);
            } else {
                reject(tempoCounts);
            }
        }
        
        // http://tech.beatport.com/2014/web-audio/beat-detection-using-web-audio/
        function getPeaksAtThreshold(data, threshold) {
            var peaksArray = [];
            var length = data.length;
            for (var i = 0; i < length;) {
                if (data[i] > threshold) {
                    peaksArray.push(i);
                    // Skip forward ~ 1/4s to get past this peak.
                    i += 10000;
                }
                i++;
            }
            return peaksArray;
        }
        
        function countIntervalsBetweenNearbyPeaks(peaks) {
            var intervalCounts = [];
            peaks.forEach(function(peak, index) {
                for (var i = 0; i < 10; i++) {
                    var interval = peaks[index + i] - peak;
                    var foundInterval = intervalCounts.some(function(intervalCount) {
                        if (intervalCount.interval === interval) return intervalCount.count++;
                    });
                    //Additional checks to avoid infinite loops in later processing
                    if (!isNaN(interval) && interval !== 0 && !foundInterval) {
                        intervalCounts.push({
                            interval: interval,
                            count: 1
                        });
                    }
                }
            });
            return intervalCounts;
        }
        
        function groupNeighborsByTempo(intervalCounts) {
            var tempoCounts = [];
            intervalCounts.forEach(function(intervalCount) {
                //Convert an interval to tempo
                var theoreticalTempo = 60 / (intervalCount.interval / 44100);
                theoreticalTempo = Math.round(theoreticalTempo);
                if (theoreticalTempo === 0) {
                    return;
                }
                // Adjust the tempo to fit within the 90-180 BPM range
                while (theoreticalTempo < 90) theoreticalTempo *= 2;
                while (theoreticalTempo > 180) theoreticalTempo /= 2;
            
                var foundTempo = tempoCounts.some(function(tempoCount) {
                    if (tempoCount.tempo === theoreticalTempo) return tempoCount.count += intervalCount.count;
                });
                if (!foundTempo) {
                    tempoCounts.push({
                        tempo: theoreticalTempo,
                        count: intervalCount.count
                    });
                }
            });
            return tempoCounts;
        }
        
        // http://stackoverflow.com/questions/1669190/javascript-min-max-array-values
        function arrayMin(arr) {
            var len = arr.length,
                min = Infinity;
            while (len--) {
                if (arr[len] < min) {
                    min = arr[len];
                }
            }
            return min;
        }
        
        function arrayMax(arr) {
            var len = arr.length,
                max = -Infinity;
            while (len--) {
                if (arr[len] > max) {
                    max = arr[len];
                }
            }
            return max;
        }


        var context = new(window.AudioContext || window.webkitAudioContext)();
        fetch(audioURL).then((resp1) => {
            resp1.arrayBuffer().then((arrayBuffer) => {
                context.decodeAudioData(arrayBuffer, function(buffer) {
                    prepare(buffer);
                });
            });
        });
    });
}

/**
 * 다른 BPM Detecting 방식 (Promise)
 *     Posted by Timothy Moody
 *     Retrieved 2026-05-24, License - CC BY-SA 3.0
 */
function detectBpm2(audioURL) {
    return new Promise((resolve, reject) => {
        function createBuffers(url) {

            // Fetch Audio Track via AJAX with URL
            request = new XMLHttpRequest();

            request.open('GET', url, true);
            request.responseType = 'arraybuffer';

            request.onload = function(ajaxResponseBuffer) {

                // Create and Save Original Buffer Audio Context in 'originalBuffer'
                var audioCtx = new AudioContext();
                var songLength = ajaxResponseBuffer.total;

                // Arguments: Channels, Length, Sample Rate
                var offlineCtx = new OfflineAudioContext(1, songLength, 44100);
                source = offlineCtx.createBufferSource();
                var audioData = request.response;
                audioCtx.decodeAudioData(audioData, function(buffer) {

                    window.originalBuffer = buffer.getChannelData(0);
                    var source = offlineCtx.createBufferSource();
                    source.buffer = buffer;

                    // Create a Low Pass Filter to Isolate Low End Beat
                    var filter = offlineCtx.createBiquadFilter();
                    filter.type = "lowpass";
                    filter.frequency.value = 140;
                    source.connect(filter);
                    filter.connect(offlineCtx.destination);
                        // Render this low pass filter data to new Audio Context and Save in 'lowPassBuffer'
                        offlineCtx.startRendering().then(function(lowPassAudioBuffer) {
                            var audioCtx = new(window.AudioContext || window.webkitAudioContext)();
                            var song = audioCtx.createBufferSource();
                            song.buffer = lowPassAudioBuffer;
                            song.connect(audioCtx.destination);

                            // Save lowPassBuffer in Global Array
                            window.lowPassBuffer = song.buffer.getChannelData(0);
                            console.log("Low Pass Buffer Rendered!");

                            // Overwrite our array buffer to a 10 second clip starting from 00:10s
                            window.lowPassFilter = getClip(10, 10, window.lowPassFilter);
                            // Down Sample Your Clip
                            window.lowPassBuffer = getSampleClip(window.lowPassFilter, 300);
                            // Overwrite our array to the normalized array
                            window.lowPassBuffer = normalizeArray(window.lowPassBuffer);
                            // Count the Groupings
                            let res = countFlatLineGroupings(lowPassBuffer);
                            resolve(res);
                        });
                    },
                    function(e) {});
            }
            request.send();
        }

        function getClip(length, startTime, data) {

            var clip_length = length * 44100;
            var section = startTime * 44100;
            var newArr = [];

            for (var i = 0; i < clip_length; i++) {
                newArr.push(data[section + i]);
            }

            return newArr;
        }

        function getSampleClip(data, samples) {
            var newArray = [];
            var modulus_coefficient = Math.round(data.length / samples);

            for (var i = 0; i < data.length; i++) {
                if (i % modulus_coefficient == 0) {
                    newArray.push(data[i]);
                }
            }
            return newArray;
        }

        // Overwrite our array to down-sampled array.
        function normalizeArray(data) {

            var newArray = [];

            for (var i = 0; i < data.length; i++) {
                newArray.push(Math.abs(Math.round((data[i + 1] - data[i]) * 1000)));
            }

            return newArray;
        }

        function countFlatLineGroupings(data) {
            var groupings = 0;
            var newArray = normalizeArray(data);

            function getMax(a) {
                var m = -Infinity,
                    i = 0,
                    n = a.length;

                for (; i != n; ++i) {
                    if (a[i] > m) {
                        m = a[i];
                    }
                }
                return m;
            }

            function getMin(a) {
                var m = Infinity,
                    i = 0,
                    n = a.length;

                for (; i != n; ++i) {
                    if (a[i] < m) {
                        m = a[i];
                    }
                }
                return m;
            }

            var max = getMax(newArray);
            var min = getMin(newArray);
            var count = 0;
            var threshold = Math.round((max - min) * 0.2);

            for (var i = 0; i < newArray.length; i++) {

            if (newArray[i] > threshold && newArray[i + 1] < threshold && newArray[i + 2] < threshold && newArray[i + 3] < threshold && newArray[i + 6] < threshold) {
                    count++;
                }
            }

            return count;
        }
        createBuffers(audioURL);
    });
}