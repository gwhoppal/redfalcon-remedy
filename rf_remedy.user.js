// ==UserScript==
// @name				Red Falcon Remedy
// @version				2.5.5
// @namespace			http://toswy.com/
// @description			Modifies Red Falcon for the better of TOS. Designed for Firefox
// @include				https://*.redcheetah.com/*/admin/*
// @grant				GM_getValue
// @grant				GM_setValue
// @grant				GM_deleteValue
// @require       		https://code.jquery.com/jquery-2.1.1.min.js
// @downloadURL			https://github.com/gwhoppal/redfalcon-remedy/raw/master/rf_remedy.user.js
// @updateURL			https://github.com/gwhoppal/redfalcon-remedy/raw/master/rf_remedy.user.js
// ==/UserScript==

document.getElementsByClassName('navbar-logo')[0].style.visibility = 'hidden';

jQuery.noConflict();
var loc = window.location.href;
var company = "torrington";
if (loc.indexOf("bhbs") != -1) {
	company = "bhbs";
}

companycap = company[0].toUpperCase() + company.slice(1);
var pagename = loc.substring(loc.lastIndexOf("/")+1,loc.lastIndexOf(".php")); // gets the current page we are on for styling

jQuery(".navbar-logo").hide();
jQuery("<link/>", {
	rel: "stylesheet",
	href: "https://toswy.com/rf_remedy.style.css",
	type: "text/css"
}).appendTo("head");

// check all or check none
ss = document.createElement("script");
ss.type = "text/javascript";
ss.innerHTML = "function TOScheckAll(tocheck) { checkboxes = document.querySelectorAll('input[type=checkbox]'); for (i = 0, c = checkboxes.length; i < c; ++i) checkboxes[i].checked = tocheck; }";
document.getElementsByTagName("head")[0].appendChild(ss);

if (loc == "https://www.redcheetah.com/torrington/admin/" || loc == "https://www.redcheetah.com/bhbs/admin/" || loc.indexOf("index.php") != -1) {
	jQuery("body").addClass(company + " login");
} else { // this is code we want to execute on all pages but the login
	jQuery("body").addClass(company + " " + pagename + " notlogin");
}

jQuery(document).ready(function($) {
	
	// *****************************************************
	// LOGIN - login; else any other page
	// *****************************************************
	if (loc == "https://www.redcheetah.com/torrington/admin/" || loc == "https://www.redcheetah.com/bhbs/admin/" || loc.indexOf("index.php") != -1) {
		$("title").text("Red Falcon Login");
		$("#username").focus();
		if ($("form[name='clearForm']").length) { $("#clearformpassword").focus() }; // change focus if currently logged in
		$("form").submit(function() { GM_setValue("username",$(this).find("[name='username']").val()); }); // grab username when we submit form
	} else { // this is code we want to execute on all pages but the login
		$("title").text("Red Falcon " + companycap);
		if (company == "torrington") { $("img[src*='img_lvl2.gif']").attr("src","http://toswy.com/toslogo.png"); } // change print logo
		$("a[href='pending_orders_export.php']").parent().parent().parent().remove(); // remove "Export to Wholesaler" shortcut in side menu
		$("header .nav_alerts").prepend('<li><a href="https://www.redcheetah.com/'+company+'/admin/" title="Home"><i class="fa fa-2x fa-home"></i> '+companycap+'</a></li><li class="divider-vertical hidden-phone hidden-tablet"></li>'); // add home link to nav bar
		$("header ul.user_menu.pull-right li a[href='logout.php'] span").text("Logout "+GM_getValue("username"));
		$("#trnrmd, #trnrmdp, #trnrmdr, #trnrmdf, #trnrmddd, .training-link").hide();
	}
	
	
	
	
	// *****************************************************
	// HOME PAGE - shown after login
	// *****************************************************
	if (loc.indexOf('main.php') != -1) {
		trgt = $("#dealerMessages").parent();
		$("#dealerMessages").detach().appendTo(trgt);
	}
	
	
	
	
	// *****************************************************
	// ACCOUNTING - export; any export screen
	// *****************************************************
	if (loc.indexOf('accounting_export') != -1) {
		$('.bodymargin > div > div > table').parent().prepend('<div class="tosblock"><a href="javascript: TOScheckAll(true);">Check All</a> or <a href="javascript: TOScheckAll(false);">Check None</a></div>'); // add toggle checkboxes option after "Export" table header
	}
	if (loc.indexOf('accounting_credit') != -1) {
		$('.bodymargin > div > table').parent().prepend('<div class="tosblock"><a href="javascript: TOScheckAll(true);">Check All</a> or <a href="javascript: TOScheckAll(false);">Check None</a></div>'); // add toggle checkboxes option after "Export" table header
	}

	
	
	
	// *****************************************************
	// ORDERS - credit memo; add
	// *****************************************************
	if (loc.indexOf('credit_memo_add.php') != -1) {
		if ($(".printEnvelopeInvoice").length) { // on the print screen
			var cmnum = $(".printEnvelopeInvoice > tbody > tr:eq(1) > td:eq(1) > span").text();
			$(".bodymargin").html('<div id="tosinfo">Your Credit Number is <span>'+cmnum+'</span>. <a href="https://www.redcheetah.com/'+company+'/admin/reports_invoice.php">Print Credit Memo</a></div>');
			$("body").on("click","#tosinfo a",function() {
				GM_setValue("printinv",cmnum);
				GM_setValue("autoprint",true);
			});
		}
	}
	
	
	
	
	// *****************************************************
	// ORDERS - misc or note popup
	// *****************************************************
	if (loc.indexOf('item_miscnote.php') != -1) {
		if (loc.indexOf('item_type=note') != -1) {
			$("input[name='desc']").focus();
		} else {
			$("select[name='sku'] option").each(function() {
				var txt = $(this).text();
				if (txt.indexOf('Misc - ') != -1) { // this is a misc category (misc furniture, not just misc)
					if (txt == 'Misc - Other Custom' && company == 'torrington') {
						$(this).text("Scrapbooking");
					} else if (txt == 'Misc - Freight' && company == 'torrington') {
						$(this).text("Art");
					}else {
						txt = txt.substr(7);
						$(this).text(txt);
					}
				}
			});
			$("select[name='sku']").append($("select[name='sku']").find('option').sort(function(a, b){ // sort the options
				return (a = $(a).text(), b = $(b).text(), a == 'NA' ? 1 : b == 'NA' ? -1 : 0|a > b);
			}));
			$("select[name='sku']").val('').focus();
		}
	}
	
	
	
	
	// *****************************************************
	// ORDERS - point of sale; entry & checkout
	// *****************************************************
	if (loc.indexOf("order_pos.php") != -1) {
        if ($("[name='pos_payment_credit_auth']").parent().length) { $("#usbhid").next("table").addClass("toscheckout"); }
		// remove some fields from checkout and change some values to defaults we use
		$("[name='pos_payment_credit_type'], [name='pos_payment_credit_new_pan'], [name='pos_payment_credit_new_csc']").parent().hide();
		$("[name='pos_payment_credit_month'], [name='pos_payment_credit_billing_address']").parent().parent().parent().parent().hide();
		$("[name='pos_payment_credit_auth']").val("0000"); // add authorization default value
		var pos_auth_code = $("[name='pos_payment_credit_amount']").parent();
		$("[name='pos_payment_credit_auth']").parent().clone().insertAfter(pos_auth_code); // move authorization code inline with credit card
		$("[name='pos_payment_credit_auth']:last").parent().hide(); // hide original authorization code
		/*$("label[for='pos_payment_gift']").text("Gift Card"); // change "Gift Certificate" to "Gift Card"
		$("[name='pos_payment_gift_number']").val("1111").parent().hide(); // add gift card default number*/
		$("label[for='pos_payment_gift']").parent().parent().hide(); // remove breaks RF code so we just hide it instead
		
		// get the invoice number and autoprint
		if ($(".printEnvelopeInvoice").length) {
			if ($(".bodymargin > div > div:first > table:eq(1) > tbody > tr:first > td:first > b").length) { // existing customer; we have to find order number differently
				$(".bodymargin > div > div:first table").remove();
				invnum = $(".bodymargin > div > div:first").text();
				amount = $(".bodymargin > div > div:eq(2) table table td.boldText:first").text();
			} else { // point of sale customer
				// find the order number on the page
				invnum = $(".bodymargin > div > div:first > table:eq(1) > tbody > tr > td").text();
				amount = $(".bodymargin > div > div:eq(2) table table td.boldText:first").text();
			}
			invnum = invnum.substr(invnum.indexOf("Order")+6,6);
			$(".bodymargin").html('<div id="tosinfo">Your Order Number is <span>'+invnum+'</span> for <span>'+amount+'</span>. <a href="https://www.redcheetah.com/'+company+'/admin/reports_invoice.php">Print Invoice</a></div>');
			$("body").on("click","#tosinfo a",function() {
				GM_setValue("printinv",invnum);
				GM_setValue("autoprint",true);
			});
		}
	}

	
	
	
	// *****************************************************
	// ORDERS - quick order
	// *****************************************************
	if (loc.indexOf('order_quickadd.php') != -1) {
		if ($(".bodymargin > div > div:first").text() == "Quick Order generated.") { // we are on the quick order confirmation/print screen
			pnt = $(".bodymargin > div > div:eq(1)"); // point to the proper div to find the order number
			tmp = pnt.clone(); // copy the div so we don't actually mess it up
			tmp.find("table").remove(); // get rid of the table so the order number is easier to find
			tmp = tmp.text(); // get rid of the html
			tmp = '<div class="tosblock"><span class="largenoticered">#' + tmp.substr(tmp.indexOf("Order")+6,6) + '</span></div>';
			pnt.before(tmp); // insert the order number nice and big
			//$(".bodymargin > div > div:eq(4) table table tr:eq(-3)").prepend('<td colspan="5"></td>'); // add extra column
			$(".bodymargin > div > div:eq(4) table table td").addClass("tostesting").css({"border":"1px solid #000","padding":"3px"});
		}
	}

	
	
	
	// *****************************************************
	// ORDERS - pending order detail
	// *****************************************************
	if (loc.indexOf('pending_orders_detail.php') != -1) {
		// total up the cost for each vendor and add it below the bulk po button
		var qty = 0;
		var vendors = new Array();
		vendors["S.P. Richards"] = 0.00;
		vendors["SPR - FCP"] = 0.00;

		$("table table tr").each(function(i) {
			if (i > 0) {
				if (i % 2) { // odd row has quantity
					qty = $(this).find("input[name^='pending_order_quantity_']").val();
				} else {
					if ($(this).hasClass("vendor_row")) {
						vendor = $(this).find("input:checked").prev('a').prev('a').text();
						cost = $(this).find("input:checked").prev('a').text();
						cost = cost.slice(1,cost.indexOf(' '));
						cost = parseFloat(cost);
						vendors[vendor] += parseFloat(cost * qty);

						vendor = ''; cost = 0; qty = 0;
					}
				}
			}
		});

		vendortable = '<br><br><table class="table table-bordered"><tbody><tr>';
		vendortable += ( (vendors["S.P. Richards"] > 0 && vendors["S.P. Richards"] < 15) ? '<td bgcolor="#f2dede">S.P. Richards: $' + vendors["S.P. Richards"] + '</td>' : '<td bgcolor="#dff0d8">S.P. Richards: $' + vendors["S.P. Richards"] + '</td>' );
		vendortable += ( (vendors["SPR - FCP"] > 0 && vendors["SPR - FCP"] < 15) ? '<td bgcolor="#f2dede">SPR - FCP: $' + vendors["SPR - FCP"] + '</td>' : '<td  bgcolor="#dff0d8">SPR - FCP: $' + vendors["SPR - FCP"] + '</td>' );
		vendortable += '</tr></tbody></table>';
		$("#bulk-po-button").after(vendortable);
	}

	
	
	
	// *****************************************************
	// ORDERS - transmitted order detail
	// *****************************************************
	if (loc.indexOf('post_edi_detail.php') != -1) {
		$("td.required").parent().addClass("tosrequired");
	}

	
	
	
	// *****************************************************
	// ORDERS - packing slips; list view
	// *****************************************************
	if (loc.indexOf('packing_slip_edit.php') != -1) {
		//$("[name='form_action_4'],[name='form_action_5']").remove();
        $("input:checkbox").prop('checked',false);
	}

	
	
	
	// *****************************************************
	// ORDERS - packing slips; single view
	// *****************************************************
	if (loc.indexOf('packing_slip_detail.php') != -1) {
		//$("[name='form_action_5']").remove();
	}
	
	
	
	
	// *****************************************************
	// QUOTES - adding; inital screen
	// *****************************************************
	if (loc.indexOf('quote_add.php') != -1) {
		$("#idquoteadd_nameDiv").before('<div><h3><u>HOW TO NAME QUOTES</u></h3><br />Your Initials - Month/Day - Customer (quote identifier)<br />Include "GSA" (without quotes) in all caps for a HON GSA quote.<p>EX. Quote by Greg on August 19, 2011 for Customer Copy Paper<br /><strong>GH-08/19/2015-Customer (Copy Paper)</strong></p></div>');
	}

	
	
	
	// *****************************************************
	// QUOTES - printing
	// *****************************************************
	if (loc.indexOf('quote_print.php') != -1) {
		$("div.bodymargin > div > div:last-child").find("div:last-child").html(''); // get rid of address at bottom of quote
	}
	
	
	
	
	// *****************************************************
	// REPORTS - invoices
	// *****************************************************
	if (loc.indexOf("reports_invoice.php") != -1) {
		
		if ($(".bodymargin > div > div:eq(2)").length) { // invoices listed below search
			//$(".bodymargin > div > div:eq(2) > table [name='form_action_1']").remove(); // remove the print invoices button
			$("input[value='Export to PDF']").remove(); // remove Export to PDF button
			$(".bodymargin > div > div:eq(2) > table").attr("cellspacing","0").css({"cssText":"border-collapse:collapse !important"});
			rows = $(".bodymargin > div > div:eq(2) > table > tbody > tr").not(":lt(1)").not(":gt(-3)");
			rows.each(function(i){ if (i%2 === 1) { $(this).css({"background-color":"#e1e1e1"}); } }); // add alternating row colors
			rows.css({"border":"1px solid #a1a1a1"}).find("td").css({"padding":"3px"}); // add border class to proper table rows
		}
		
		if ($(".printEnvelopeInvoice").length) { // invoices ready to print
			$(".printEnvelopeInvoice").parent().addClass("printfullwidth").next().find("div:eq(0) > table > tbody > tr > td").css({"background-color":"#000"}).attr("bgcolor",""); // add border to print invoices
			if (company == 'torrington') { $(".printEnvelopeInvoice img[src*='toslogo.png']").attr("src","http://toswy.com/toslogo.jpg").attr("width","67%"); }
			
			// remove TOS address from credit memos
			$(".printEnvelopeInvoice").each(function(i){
				// remove extra address box on credit memos
				if ($(this).find("tbody > tr:eq(1) > td:first > span").text() == "CREDIT MEMO") {
					$(this).find("tbody > tr:eq(1) table").remove();
				}
				
				// remove empty cells by order taker
				$(this).find("tbody:first > tr:eq(3) tr td").each(function(j){
					tdcell = $.trim($(this).html());
					if (tdcell.length < 1 || tdcell == "Terms:") { $(this).remove(); }
				});
				
				// convert table to single table for better printing
				items = $(this).parent().next().find("table table");
				mytable = '<table class="tosprintitems" cellpadding="0" cellspacing="0">' + $(this).parent().next().find("div:eq(0) > table table").html() + '</table>';
				$(this).parent().next().find("div:eq(0)").html(mytable);
			});
			
			var sigline = '<tr valign="middle"><td align="left" valign="middle" colspan="8"><strong>Signature:</strong><br /><br /></td></tr>';
			$(".tosprintitems").each(function(i){ $(this).find("tr:last").after(sigline); $(this).parent().addClass("printfullwidth"); });
			$(".tosprintitems td").wrapInner('<div class="pagebreak"></div>');
			setTimeout(function(){ window.print(); }, 1000);

			// allow highlighting rows on invoices
			$(".tosprintitems").find("td").click(function(e) {
				tdptr = (e.shiftKey) ? $(this).parent().children("td") : $(this); // if shift key is pressed, highlight the whole row
                ($(this).hasClass("highlight")) ? tdptr.removeClass("highlight") : tdptr.addClass("highlight");
			});
		}
		
		if (GM_getValue("autoprint")) { // we have the invoice number stored, we can automatically pull up the invoice
			if ($(".printEnvelopeInvoice").length) { // invoice(s) ready to print
				GM_deleteValue("autoprint");
				//window.print(); // taken out to use above
			} else if ($(".bodymargin > div > div:eq(2)").length) { // "View Invoices" button has already been clicked
				$("input:checkbox").prop('checked', true); // check what should be the only checkbox
				$("[name='form_action_1']:last").click(); // click the "Print Invoices" button; form_action_1: print, form_action_3: export pdf
			} else {
				$("#invoice_order_number").val(GM_getValue("printinv")); // put the order number in the form before submitting
				GM_deleteValue("printinv");
				$("[name='form_action_1']:first").click(); // click the "View Invoices" button
			}
		}
	}
	
	
	
	
	// *****************************************************
	// REPORTS - invoices
	// *****************************************************
	if (loc.indexOf("reports_invoice_view.php") != -1) {
		$("[name='form_action_2']").remove();
	}

	
	
	
	// *****************************************************
	// REPORTS - point of sale
	// *****************************************************
	if (loc.indexOf('reports_pos.php') != -1) {
		$("#contentPanel > div > div > div:last > table").css({"cssText":"border-collapse:collapse !important"}).find("td:contains('Total')").parent().css({"background":"#faebcc"});
	}
});

jQuery("<link/>", {
	rel: "shortcut icon",
	href: "https://toswy.com/rf_logo_angrybird.png"
}).appendTo("head");