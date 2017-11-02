/* Copyright (C) 2017 Project-EBDO
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * EBDO-FeatureService Examples functions
 * Author: Joseph Allemandou
 */
'use strict';

var HyperSwitch = require('hyperswitch');
const URI = HyperSwitch.URI;
var path = require('path');
var fsUtil = require('../lib/FeatureServiceUtil');

var spec = HyperSwitch.utils.loadSpec(path.join(__dirname, 'examples.yaml'));

const STEP_TO_SECONDS = {
    second:    1,
    minute:   60,
    hour:   3600,
    day:   86400
};



class TimeserieTreament {
    constructor(options) {
        this.options = options;
	}

	fakeTimeserie(hyper, req) {
	    var requestParams = req.params;

	    fsUtil.validateFromAndTo(requestParams);

	    var fromDate = requestParams.fromDate;
	    var intervalSeconds = (requestParams.toDate - fromDate) / 1000;
	    var stepSeconds = STEP_TO_SECONDS[requestParams.step];

	    if (stepSeconds > intervalSeconds) {
	        fsUtil.throwIfNeeded('Step should be smaller than [from, to[ interval');
	    }

	    var stepNumbers = intervalSeconds / stepSeconds;

	    return fsUtil.normalizeResponse({
	        status: 200,
	        body: {
	            items: [...Array(stepNumbers).keys()].map(idx => {
	                return {
	                    ts: (new Date(fromDate.getTime() + (idx * stepSeconds * 1000))).toISOString(),
	                    val: Math.random()
	                };
	            })
	        }
	    });
	}

	async meanTimeserie(hyper, req) {
		var requestParams = req.params;
	    fsUtil.validateFromAndTo(requestParams);

		const uriFakeTS = new URI([requestParams.domain, 'sys', 'examples',
			'fake-timeserie',requestParams.from,
			requestParams.to,requestParams.step]);

		var avg = await hyper.get({ uri: uriFakeTS }).then((res) =>
			res.body.items.map(items => items.val).
				reduce((prev, next) => prev + next, 0)/res.body.items.length);

	    return fsUtil.normalizeResponse({
	        status: 200,
	        body: {
	            items:
					avg
			}
	    });

	};
// contribution of ghina abdallah
	
	async minTimeserie(hyper, req) {
		var requestParams = req.params;
	    fsUtil.validateFromAndTo(requestParams);

		const uriFakeTS = new URI([requestParams.domain, 'sys', 'examples',
			'fake-timeserie',requestParams.from,
			requestParams.to,requestParams.step]);

		var minimum = await hyper.get({ uri: uriFakeTS }).then((res) =>
			res.body.items.map(items => items.val).
				reduce((prev, next) => {return Math.min(prev, next);
		}));
				
	    return fsUtil.normalizeResponse({
	        status: 200,
	        body: {
	            items:
					minimum
			}
	    });

	};

	async maxTimeserie(hyper, req) {
		var requestParams = req.params;
	    fsUtil.validateFromAndTo(requestParams);

		const uriFakeTS = new URI([requestParams.domain, 'sys', 'examples',
			'fake-timeserie',requestParams.from,
			requestParams.to,requestParams.step]);

		var maximum = await hyper.get({ uri: uriFakeTS }).then((res) =>
			res.body.items.map(items => items.val).
				reduce((prev, next) => {return Math.max(prev, next);
		}));
				
	    return fsUtil.normalizeResponse({
	        status: 200,
	        body: {
	            items:
					maximum
			}
	    });

	};
	// to here ***********/	
}

module.exports = function(options) {
	var tst = new TimeserieTreament(options);

    return {
        spec: spec,
        operations: {
            fakeTimeserie: tst.fakeTimeserie.bind(tst),
			meanTimeserie: tst.meanTimeserie.bind(tst)
        }
    };
};
