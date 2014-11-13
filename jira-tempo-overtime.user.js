// ==UserScript==
// @name        Jira Tempo Overtime
// @description Greasemonkey Overtime User script for Jira Tempo plugin
// @author      Arcao
// @version     1.0.3
// @namespace   com.gk-software.es.msloup.jira.tempo.overtime
// @include     https://jira.gk-software.com/secure/TempoUserBoard!timesheet.jspa*
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @updateURL   https://github.com/arcao/GMJiraTempoOvertime/raw/master/jira-tempo-overtime.meta.js
// @grant       GM_addStyle
// ==/UserScript==
try {
  
function roundTime(time) {
  return Math.ceil(time * 100) / 100; // round on two decimal places
}

function getCurrentWorkedDay() {
  var workedDays = 0;
  var skipNext = false;

  $('#issuetable thead tr:first-child th:gt(0)').each(function(index, el){
    if (skipNext)
      return;
    
    var $th = $(this);
    
    if ($th.hasClass('tt-holiday'))
      return;
    
    var dateData = $th.attr('data-tempo-date');
    var date = new Date(parseInt(dateData.substr(4, 4)), parseInt(dateData.substr(2,2)) - 1, parseInt(dateData.substr(0,2)), 0, 0, 0, 0);
    
    if (date.getDay() != 0 && date.getDay() != 6)
      workedDays++;
    
    if ($th.hasClass('tt-current-day'))
      skipNext = true;
  });
  
  return workedDays;
}
  
function getWorkDays(skipDays, count) {
  var firstDayTh = 1;
  var workDays = 0;
  
  var start = firstDayTh + skipDays;
  var end = start + count;
  
  $('#issuetable thead tr:first-child th').slice(start, end).each(function(index, el){
    var $th = $(this);
    
    if ($th.hasClass('tt-holiday'))
      return;

    var dateData = $th.attr('data-tempo-date');
    var date = new Date(parseInt(dateData.substr(4, 4)), parseInt(dateData.substr(2,2)) - 1, parseInt(dateData.substr(0,2)), 0, 0, 0, 0);
    
    if (date.getDay() != 0 && date.getDay() != 6)
      workDays++;
  });
  
  return workDays;
}

function prettyTime(input) {
  var time = parseFloat(input);
  var text = "";
  
  if (!isNaN(time)) {
    var sign = Math.sign(time); 
    time = Math.abs(time);
  
    var hours = parseInt(time);
    var minutes = Math.ceil((time - hours) * 60);
    
    if (sign < 0)
      text+="-";
    
    if (hours < 10)
      text+="0";
    
    text+=hours;
    text+=":";
    
    if (minutes < 10)
      text+="0";
    
    text+=minutes;   
  }
  
  return text;
}
  
var handledDays = 0;

var sumTr = $('#issuetable tfoot tr:nth-last-child(2) th:gt(0)').each(function(){
  var th = $(this);
  var time = th.text().trim();
  if (time.length > 0) {
    time = parseFloat(time);
    
    var days = Math.max(parseInt(th.attr('colspan')), 1);
    var workDays = getWorkDays(handledDays, days);
    
    //alert(days);
    
    handledDays = handledDays + days;
   
    time = roundTime(time - workDays * 8);
    
    if (time < 0) {
      th.append($(' <span style="color:red" title="'+ prettyTime(time) + '">(' + time + ')</span>'));
    } else {
      th.append($(' <span style="color:green" title="'+ prettyTime(time) + '">(' + time + ')</span>'));
    }
  } 
});

// summary table
var $currentWeek = $('#tempo-table table.total-work-bottom tbody tr:first td:first');
var $currentTotal = $('#tempo-table table.total-work-bottom tbody tr:first td:last');

var $requiredLabel = $('#tempo-table table.total-work-bottom tbody tr:last th:first');
var $requiredWeek = $('#tempo-table table.total-work-bottom tbody tr:last td:first');
var $requiredTotal = $('#tempo-table table.total-work-bottom tbody tr:last td:last');
  
var differenceWeekTime = roundTime(parseFloat($currentWeek.text()) - parseFloat($requiredWeek.text()));
var differenceTotalTime = roundTime(parseFloat($currentTotal.text()) - parseFloat($requiredTotal.text()));

$requiredLabel.append('<br/>&nbsp;');
  
if (differenceWeekTime < 0) {
  $requiredWeek.append($('<br/><span style="color:red" title="'+ prettyTime(differenceWeekTime) + '"> (' + differenceWeekTime + ')</span>'));
} else {
  $requiredWeek.append($('<br/><span style="color:green" title="'+ prettyTime(differenceWeekTime) + '"> (' + differenceWeekTime + ')</span>'));
}

if (differenceTotalTime < 0) {
  $requiredTotal.append($('<br/><span style="color:red" title="'+ prettyTime(differenceTotalTime) + '"> (' + differenceTotalTime + ')</span>'));
} else {
  $requiredTotal.append($('<br/><span style="color:green" title="'+ prettyTime(differenceTotalTime) + '"> (' + differenceTotalTime + ')</span>'));
}

var $totalTable = $('#tempo-table table.total-work-bottom');
  
var workedTime = getCurrentWorkedDay() * 8;
if (workedTime == 0)
  workedTime = parseFloat($requiredTotal.text());
  
var currentAverage = roundTime(parseFloat($currentTotal.text()) - workedTime);

if (currentAverage < 0) {
  $totalTable.append($('<tfoot><tr><th>Average:</th><td/><td class="no-border"><span style="color:red" title="'+ prettyTime(currentAverage) + '">' + currentAverage + '</span></td></tr></tfoot>'));
} else {
  $totalTable.append($('<tfoot><tr><th>Average:</th><td/><td class="no-border"><span style="color:greeen" title="'+ prettyTime(currentAverage) + '">' + currentAverage + '</span></td></tr></tfoot>'));
}
  
    
} catch (err) {

    // If an error was thrown, go ahead and present it as an alert to help
    // with debugging any problems
    //alert(err.toString());
}
