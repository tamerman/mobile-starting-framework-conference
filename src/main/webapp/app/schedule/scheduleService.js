/*
 * The MIT License
 * Copyright (c) 2011 Kuali Mobility Team
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
'use strict';

/* Services */

function ScheduleService($http, $q, $scope, $window, $rootScope){

    this.localSession = null;

    this.conferenceName = "Kuali Days 2014";
    this.conferenceLocation = "Indianapolis";
    this.conferencePresentationMaterialsUrl = ""; // TODO add your dropbox URL
    var programURL = ""; // TODO add your program URL

	this.getConferenceDates = function(){
        return [
//            "2013-11-18T100000Z",
//            "2013-11-19T100000Z",
//            "2013-11-20T100000Z",
//            "2013-11-21T100000Z",
            "2014-11-10T100000Z",
            "2014-11-11T100000Z",
            "2014-11-12T100000Z",
            "2014-11-13T100000Z"
        ];
	}

	this.getInfo = function(str_date){
		var info = {
			jsonURL 	: 'json/passthrough?feedurl='+encodeURI(programURL),
//            jsonURL 	: '/conference/kd2013sessions.json',
			description	: 'The schedule of all conference sessions.'
		}
		return info;
	}

	this.getSchedule = function(str_date){
		var defer 			  = $q.defer();
		var datesOfConference = this.getConferenceDates();

		$http({
			method : 'GET',
			url : this.getInfo(str_date).jsonURL
		}).success(function(data, status, headers, config) {
			 if( status != 200 ) {
				 return defer.reject(status);
             }
			var sessions = data.program.sessions;
			var monthNameToNumber = {
					"Jan":"01",
					"Feb":"02",
					"Mar":"03",
					"Apr":"04",
					"May":"05",
					"Jun":"06",
					"Jul":"07",
					"Aug":"08",
					"Sep":"09",
					"Oct":"10",
					"Nov":"11",
					"Dec":"12"
				}

			// let's add data and re-format some
			//var oneDayInMiliseconds = 86400000;	// Hack because Angular is odd.
			var oneDayInMiliseconds = 0;
			for(var s in sessions){
				// IE making us reformat date
				// sessions[s].date   = forIEDateArray[2]+"-"+monthNameToNumber[forIEDateArray[1]]+"-"+(parseInt(forIEDateArray[0])+1);
				var forIEDateArray = sessions[s].date.split('-');
				sessions[s].date   = monthNameToNumber[forIEDateArray[1]]+"/"+(parseInt(forIEDateArray[0]))+"/"+forIEDateArray[2];
				var startDateTime  = Date.parse(sessions[s].date+' '+sessions[s].starttime);

			    if (!startDateTime){
					var startDateTime  = new Date(sessions[s].date+' '+sessions[s].starttime).getTime();
				}

				sessions[s].dateObject = startDateTime;
				sessions[s].dateParsed = Date.parse(sessions[s].date);
				sessions[s].isOver	   = startDateTime<=(new Date()).getTime()+oneDayInMiliseconds;
			}

			defer.resolve(sessions);
		}).error(function(data, status, headers, config) {
			defer.reject(status);
		});

		return defer.promise;		
	}

}



