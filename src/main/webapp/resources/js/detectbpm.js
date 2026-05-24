/*
    This script is not my own codes.
    References from 
        https://stackoverflow.com/questions/30110701/how-can-i-use-js-webaudioapi-for-beat-detection
        http://joesul.li/van/beat-detection-using-web-audio/

    Both, there is no license mention.
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