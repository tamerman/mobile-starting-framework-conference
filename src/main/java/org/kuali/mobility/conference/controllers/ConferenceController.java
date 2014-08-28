/**
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
package org.kuali.mobility.conference.controllers;

import org.apache.commons.lang.StringEscapeUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import twitter4j.*;

import javax.servlet.http.HttpServletRequest;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.List;


@Controller
@RequestMapping("json")
public class ConferenceController {
	
	@RequestMapping("index")
	public String index(HttpServletRequest request, Model uiModel) {
		return "";
	}

	// ==================================================================================================
	// PASSTHROUGH (for attendee & attendees) JSON
	// ==================================================================================================
	// Requires "feedurl" query string parameter: ?feedurl=[[encoded URL]]
	@RequestMapping(value = "passthrough", method = RequestMethod.GET)
	public ResponseEntity<String> passthrough(
			@RequestParam(value="feedurl", required=true) String feedURL, 
			HttpServletRequest request) {
        ResponseEntity<String> responseEntity;
		try {
            System.setProperty("https.protocols", "SSLv3");
            StringBuilder jsonBuilder = new StringBuilder();
            URL feed = new URL(feedURL);

    		URLConnection urlConn = feed.openConnection();

            BufferedReader jsonLine = new BufferedReader(new InputStreamReader(urlConn.getInputStream()));

            String inputLine;

			while ((inputLine = jsonLine.readLine()) != null) {
                jsonBuilder.append(inputLine);
            }

			jsonLine.close();

            responseEntity = new ResponseEntity<String>(jsonBuilder.toString(), HttpStatus.OK);
        } catch (MalformedURLException e) {
            System.err.println(e.getLocalizedMessage());
            e.printStackTrace();
            responseEntity = new ResponseEntity<String>("", HttpStatus.BAD_REQUEST);
		} catch (IOException e) {
			System.err.println(e.getLocalizedMessage());
            e.printStackTrace();
            responseEntity = new ResponseEntity<String>("", HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println(e.getLocalizedMessage());
            e.printStackTrace();
            responseEntity = new ResponseEntity<String>("", HttpStatus.INTERNAL_SERVER_ERROR);
		}

        return responseEntity;
	}
	
	// ==================================================================================================
	// TWITTER JSON
	// ==================================================================================================
	// Requires "term" query string parameter: ?term=YourURLEncodedSearchTerm
	@RequestMapping(value = "twitter-search", method = RequestMethod.GET)
	public ResponseEntity<String> twitterSearch(
			@RequestParam(value="term", required=true) String searchParam, 
			@RequestParam(value="since", required=false) String sinceParam, 
			HttpServletRequest request) {

		Twitter twitter = TwitterFactory.getSingleton();
	    Query query = new Query( searchParam.isEmpty() ? "#kualidays" : searchParam );
	    QueryResult result = null;
	    query.setSince( !sinceParam.isEmpty() ? sinceParam : "2014-01-01" );
	    query.setCount(100);
	    query.setResultType( Query.MIXED );
	    String json = "";
	    List<String> tweetList = new ArrayList<String>();
	    
		try {
			result = twitter.search(query);
		} catch (TwitterException e) {
			System.err.println("Caught 'twitterSearch' IOException: " + e.getMessage());
		}
		
		String tweetInfo = "";
	    for (Status status : result.getTweets()) {
	    	tweetInfo  = "{";
	    	tweetInfo += "\"id\" : \""+status.getId()+"\", ";
	    	tweetInfo += "\"avatar\" : \""+status.getUser().getProfileImageURL()+"\", ";
	    	tweetInfo += "\"tweetedOn\" : \""+status.getCreatedAt()+"\", ";
	    	tweetInfo += "\"tweetedOnParsed\" : \""+status.getCreatedAt().getTime()+"\", ";
	    	tweetInfo += "\"screenname\" : \""+status.getUser().getScreenName()+"\", "; 
	    	tweetInfo += "\"status\" : \""+StringEscapeUtils.escapeHtml(status.getText().replaceAll("(\\r|\\n)", ""))+"\", "; 
	    	tweetInfo += "\"truncated\" : \""+(status.isTruncated() ? "true" : "false")+"\",";
	    	tweetInfo += "\"retweeted\" : \""+(status.isRetweet() ? "true" : "false")+"\"";
	    	tweetInfo += "}";
	    	
	    	tweetList.add(tweetInfo);
	    }
	    
	    json = "["+StringUtils.arrayToDelimitedString(tweetList.toArray(), ",")+"]";
	    
		return new ResponseEntity<String>(json, HttpStatus.OK);
	}
	
}
