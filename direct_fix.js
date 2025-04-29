// Direct fix for car UI buttons - specifically targeting the Vue component functionality
window.addEventListener('DOMContentLoaded', function() {
  console.log('Direct car UI button fix loaded');
  
  setTimeout(function() {
    function hookIntoVueEvents() {
      console.log('Attempting to hook into Vue events');
      
      const cells = document.querySelectorAll('.van-cell');
      let recoderCell = null;
      
      cells.forEach(function(cell) {
        if (cell.textContent.includes('Recoder Task Status') || 
            cell.textContent.includes('当前录制状态') || 
            cell.textContent.includes('录制状态')) {
          recoderCell = cell;
          console.log('Found Recoder Task Status cell');
        }
      });
      
      if (!recoderCell) {
        console.log('Recoder Task Status cell not found, will try again later');
        return;
      }
      
      const stopButton = recoderCell.querySelector('button');
      if (!stopButton) {
        console.log('Stop button not found, will try again later');
        return;
      }
      
      console.log('Found button:', stopButton.textContent);
      
      if (window.androidFunction) {
        console.log('Found androidFunction, creating direct connection');
        
        const originalClick = stopButton.onclick;
        stopButton.onclick = null;
        
        stopButton.addEventListener('click', function(e) {
          console.log('Stop button clicked, calling native function directly');
          
          e.preventDefault();
          e.stopPropagation();
          
          try {
            if (stopButton.textContent.includes('停止录制')) {
              console.log('Calling stopRecorder()');
              window.androidFunction.stopRecorder();
              
              setTimeout(function() {
                try {
                  let status = window.androidFunction.getAllStatus();
                  console.log('Got status:', status);
                  
                  const updateEvent = new CustomEvent('recorder-status-changed', {
                    detail: { status: status }
                  });
                  window.dispatchEvent(updateEvent);
                } catch (err) {
                  console.error('Error updating UI:', err);
                }
              }, 500);
            } else if (stopButton.textContent.includes('开始录制')) {
              console.log('Calling startHandRecorder()');
              window.androidFunction.startHandRecorder(1);
              
              setTimeout(function() {
                try {
                  let status = window.androidFunction.getAllStatus();
                  console.log('Got status:', status);
                  
                  const updateEvent = new CustomEvent('recorder-status-changed', {
                    detail: { status: status }
                  });
                  window.dispatchEvent(updateEvent);
                } catch (err) {
                  console.error('Error updating UI:', err);
                }
              }, 500);
            }
          } catch (err) {
            console.error('Error calling native function:', err);
            if (originalClick) {
              console.log('Falling back to original click handler');
              originalClick.call(stopButton, e);
            }
          }
          
          return false;
        }, true);
        
        console.log('Button click handler replaced');
      } else {
        console.log('androidFunction not found, using simulation mode');
        
        window.androidFunction = {
          stopRecorder: function() {
            console.log('Simulated stopRecorder() called');
            
            const checkIcon = recoderCell.querySelector('.van-icon-checked');
            if (checkIcon) {
              checkIcon.className = checkIcon.className.replace('van-icon-checked', 'van-icon-warning');
              checkIcon.style.color = '#ff9800';
            }
            
            const recordingTag = recoderCell.querySelector('.van-tag--success');
            if (recordingTag) {
              recordingTag.remove();
            }
            
            const label = recoderCell.querySelector('.van-cell__label');
            if (label) {
              label.textContent = 'There is no ongoing recording, click the button to start manual recording.';
            }
            
            stopButton.textContent = '开始录制';
            
            return true;
          },
          startHandRecorder: function() {
            console.log('Simulated startHandRecorder() called');
            
            const warningIcon = recoderCell.querySelector('.van-icon-warning');
            if (warningIcon) {
              warningIcon.className = warningIcon.className.replace('van-icon-warning', 'van-icon-checked');
              warningIcon.style.color = '#1989fa';
            }

            // ❌ הסרה של הוספת 录制中 — אין הוספת תגית חדשה
            
            const label = recoderCell.querySelector('.van-cell__label');
            if (label) {
              label.textContent = '录制模式：熄火录制，当前片段录制时长:4:43分21秒';
            }
            
            stopButton.textContent = '停止录制/侦测';
            
            return true;
          },
          getAllStatus: function() {
            return JSON.stringify({
              isRecoding: stopButton.textContent.includes('停止录制'),
              RecordingTag: 'H_',
              RecordingTime: 283
            });
          }
        };
        
        stopButton.addEventListener('click', function(e) {
          console.log('Button clicked in simulation mode');
          e.stopPropagation();
          
          if (stopButton.textContent.includes('停止录制')) {
            window.androidFunction.stopRecorder();
          } else {
            window.androidFunction.startHandRecorder(1);
          }
          
          return false;
        }, true);
      }
    }
    
    hookIntoVueEvents();
    
    setTimeout(hookIntoVueEvents, 1000);
    setTimeout(hookIntoVueEvents, 3000);
    
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          setTimeout(hookIntoVueEvents, 100);
        }
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }, 500);
});
