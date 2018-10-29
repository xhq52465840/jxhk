//@ sourceURL=scrollabletabs
; (function ($, undefined) {
    var settings = {
        'animateTabs': false, // THIS CAN KILL IE6 WHEN THERE ARE MANY TABS :(  When tabs loaded and when user close the tab and the rest adjust its position
        'showNavWhenNeeded': true, //false: always show no matter if there are few tabs.
        'customNavDropObj': null,
        'customNavNext': null,
        'customNavPrev': null,
        'customNavFirst': null,
        'customNavLast': null,
        'closable': true, //Make tabs closable
        'onClose': function () { },
        'onAdd': function () { },
        'onResize': function () { },
        'onActivate': function () { },
        'easing': '',
        'easing': 'swing', //The easing equation
        'loadLastTab': false, //When tabs loaded, scroll to the last tab - default is the first tab
        'onTabScroll': function () { },
        'resizable': false, //Alow resizing the tabs container
        'resizeHandles': 'e,s,se', //Resizable in North, East and NorthEast directions
        'scrollSpeed': 200, //The speed in which the tabs will animate/scroll
        'selectTabOnAdd': true,
        'selectTabAfterScroll': true,
        'showFirstLastArrows': true,
        'hideDefaultArrows': false,
        'nextPrevOutward': false,
        'wrapperCssClass': '',
        'closeTitle': ''
    }

    $.widget("custom.tabs", $.ui.tabs, {
        refresh2: function (type, liitem, index) {
            if (type) {
                var data = {};
                data.tab = liitem;
                data.index = index;
                this._trigger(type, null, data);
            }
            this.refresh();
        }
    });
    $.extend($.custom.tabs.prototype.options, { remove: null, add: null });


    $.fn.scrollabletabs = function (options) {
        return this.each(function () {
            var o = $.extend({}, settings, typeof options == 'object' ? options : {}),
                $tabs = $(this).addClass(o.wrapperCssClass + ' stMainWrapper'),
                //$ul = $tabs.find('ul.ui-tabs-nav:first').addClass("stUl"),
                $ul = $tabs.children().first().addClass("stUl"),
                //$lis = $ul.find('li'),
                $lis = $ul.children(),
                $arrowsNav = $('<ol class="stNavMain" />'),
                $curSelectedTab = $ul.find('.ui-tabs-active').addClass('stCurrentTab'); //We will use our own css class to detect a selected tab because we might want to scroll without tab being selected
            var $navDrop;
            //Navigation
            if (!o.hideDefaultArrows) {
                var $navPrev, $navNext, $navFirst, $navLast;
                $navDrop = o.customNavDropObj;
                $navPrev = $('<li class="stNavPrevArrow ui-state-active" title="Previous">' + (o.customNavPrev ? o.customNavPrev : '<span class="ui-icon ui-icon-seek-prev">Previous tab</span>') + '</li>');
                $navNext = $('<li class="stNavNextArrow ui-state-active" title="Next">' + (o.customNavNext ? o.customNavNext : '<span class="ui-icon ui-icon-seek-next">Next tab</span>') + '</li>');
                $navFirst = o.showFirstLastArrows ? $('<li class="stNavFirstArrow ui-state-active" title="First">' + (o.customNavFirst ? o.customNavFirst : '<span class="ui-icon ui-icon-seek-first">First tab</span>') + '</li>') : $();
                $navLast = o.showFirstLastArrows ? $('<li class="stNavLastArrow ui-state-active" title="Last">' + (o.customNavLast ? o.customNavLast : '<span class="ui-icon ui-icon-seek-end">Last tab</span>') + '</li>') : $();
                //Append elements to the container
                $arrowsNav.append($navPrev, $navFirst, $navLast, $navNext);
                $("li", $arrowsNav).width("17px");
                var $navLis = $arrowsNav.find('li').hover(function () { $(this).toggleClass('ui-state-active').toggleClass('ui-state-hover'); });
            }

            function _init() {
                //Set the height of the UL and make the LIs as absolute
                if ($lis.length > 0)
                    $ul.height($lis.first().outerHeight());
                else {
                    $ul.height("26px");
                }

                //Add navigation buttons
                $ul.after($arrowsNav.css('visibility', o.showNavWhenNeeded ? 'hidden' : 'visible'));

                //Adjust arrow position
                if ($navLis) {
                    $navLis.css({
                        'top': '-' + $ul.innerHeight() + 'px',
                        'height': $ul.innerHeight()
                    });

                    //Decide which navs in each pair will have to moved inside next to each other
                    if (o.nextPrevOutward) {
                        $navPrev.addClass('ui-corner-left');
                        $navNext.addClass('ui-corner-right');
                        if ($navDrop) {
                            $navPrev.css('margin-left', $navDrop.outerWidth());
                            $navFirst.css('margin-left', $arrowsNav.find('li:first').outerWidth() + $navDrop.outerWidth());
                        }
                        else {
                            $navFirst.css('margin-left', $arrowsNav.find('li:first').outerWidth());
                        }
                        $navLast.css('margin-right', $arrowsNav.find('li:first').outerWidth());
                    }
                    else {
                        $navFirst.addClass('ui-corner-left');
                        $navLast.addClass('ui-corner-right');
                        if (o.showFirstLastArrows)
                            if ($navDrop)
                                $navFirst.css('margin-left', $navDrop.outerWidth());
                            else
                                $navPrev.addClass('ui-corner-left');
                        //If we have first and last arrows to show than move the arrows inward otherwise add the css classes to make their corners round.
                        if ($navDrop)
                            o.showFirstLastArrows ? $navPrev.css('margin-left', $arrowsNav.find('li:first').outerWidth() + $navDrop.outerWidth()) : $navPrev.css('margin-left', $navDrop.outerWidth())
                        else if (o.showFirstLastArrows)
                            $navPrev.css('margin-left', $arrowsNav.find('li:first').outerWidth());
                        o.showFirstLastArrows ? $navNext.css('margin-right', $arrowsNav.find('li:first').outerWidth()) : $navNext.addClass('ui-corner-right');
                    }
                }
                //Add close buttons if required
                _addclosebutton();
                //See if nav needed
                _showNavsIfNeeded();
                //Adjust the left position of all tabs
                _adjustLeftPosition();
                //Add events to the navigation buttons
                _addNavEvents();
                //If tab is selected manually by user than also change the css class
                $tabs.on("tabsactivate", function (event, ui) {
                	if($tabs[0] == event.target){
	                    var $thisLi = $(ui.newTab);
	                    _updateCurrentTab($thisLi);
	                    //Scroll if needed
	                    if (_isHiddenOn('n')) {
	                        _animateTabTo('n', null, null, event)
	                    }
	                    else if (_isHiddenOn('p')) {
	                        _animateTabTo('p', null, null, event)
	                    }
	                    //else do nothing, tab is visible so no need to scroll tab
	                    _callBackFnc(o.onActivate, event, $thisLi);
	                    $thisLi = null;
                	}
                })
                .on("tabsadd", function (event, ui) {
                    var $thisLi = ui.tab;
                    //Update li list
                    $lis = $ul.find('li');
                    //Adjust the position of last tab
                    //Welcome the new tab by adding a close button
                    _addclosebutton($thisLi);
                    //Next move tab to the end
                    //See if nav needed
                    _showNavsIfNeeded();
                    //Adjust the left position of all tabs
                    //_adjustLeftPosition($thisLi);
                    _adjustLeftPosition();
                    //Check if select on add
                    if (o.selectTabOnAdd) {
                        //d($lis.index($thisLi));
                        $(this).tabs({ active: $lis.index($thisLi) });
                        //$(this).tabs('select', $lis.index($thisLi));
                    }
                    _callBackFnc(o.onAdd, event, $thisLi);
                    $thisLi = null;
                })
                .on("tabsremove", function (event, ui) {
                    //var $thisLi = $(ui.tab).parents('li');
                    //Update li list
                    $lis = $ul.find('li');
                    //To make sure to hide navigations if not needed
                    _showNavsIfNeeded();
                    //Adjust the position of tabs, i.e move the Next tabs to the left
                    _adjustLeftPosition();
                    //If one tab remaining than hide the close button
                    var tabslen = $("ul li", $tabs).length;
                    if (tabslen == 0)
                        return;
                    if (ui.index >= tabslen) {
                        //删掉的是最后一个
                        $(this).tabs({ active: tabslen - 1 });
                    } else if (ui.index > 0 && ui.index < tabslen) {
                        $(this).tabs({ active: ui.index - 1 });
                    }
                    else {
                        $(this).tabs({ active: 0 });
                    }
                    if ($arrowsNav.css('visibility') == "visible" && (parseFloat($lis.last().css("margin-left")) + _liWidth($lis.last())) < $ul.width()) {
                        _animateTabTo('l', $lis.last(), null, event);
                    } else if ($arrowsNav.css('visibility') == "hidden") {
                        _animateTabTo('p', $lis.first(), null, event);
                    }
                }).on("tabsresize", function (event, ui) {
                    _showNavsIfNeeded();
                    _adjustLeftPosition();
                    if ($arrowsNav.css('visibility') == "visible" && (_liWidth($lis.last() > $ul.width()))) {
                        _animateTabTo('l', $lis.last(), null, event);
                    } else if ($arrowsNav.css('visibility') == "hidden") {
                        _animateTabTo('p', $lis.first(), null, event);
                    }
                    _callBackFnc(o.onResize, event, null);
                });
            }

            //Check if navigation need than show otherwise hide it
            function _showNavsIfNeeded() {
                if (!o.showNavWhenNeeded) {
                    return; //do nothing
                }
                //Get the width of all tabs and compare it with the width of $ul (container)
                if (_liWidth() > $ul.width()) {
                    $arrowsNav.css('visibility', 'visible').show();
                }
                else {
                    $arrowsNav.css('visibility', 'hidden').hide();
                    //And navigate the tabs to the first
                    //_animateTabTo('f', $lis.first(), 0);
                }
            }

            function _callBackFnc(fName, event, arg1) {
                if ($.isFunction(fName)) {
                    fName(event, arg1);
                }
            }

            function _isHiddenOn(side, $tab) {
                //If no tab is provided than take the current
                $tab = $tab || $curSelectedTab;
                if ($tab.length == 0)
                    return false;
                if (side == 'n') {
                    //var rightPos = $tab[0].offsetLeft + $tab.outerWidth(true) + 5;
                    var rightPos = $tab[0].offsetLeft + ($tab.outerWidth(true) > 0 ? $tab.outerWidth(true) : $tab.outerWidth()) + 5; // modify by wayne 
                    return (rightPos > ($ul.outerWidth() - _getNavPairWidth()));
                }
                else//side='p'
                {
                    var leftPos = ($tab[0].offsetLeft - _getNavPairWidth());
                    return (leftPos < 0)
                }
            }

            function _pullMargin($tab, single) {                
                return '-' + (_liWidth($tab) - $ul.width() + _getNavPairWidth(single)) + 'px';
            }

            function _pushMargin($tab, single) {
                var leftPos = ($tab[0].offsetLeft - 5 - _getNavPairWidth(single)); // 补个5，与490行相呼应
                return (parseFloat($tab.css('margin-left')) - leftPos) + 'px';
            }

            function _animateTabTo(side, $tab, tabIndex, e) {
                $tab = $tab || $curSelectedTab;
                var margin = 0;
                if (side == 'n') {
                    margin = _pullMargin($tab);
                }
                else if (side == 'p') {
                    margin = _pushMargin($tab);
                }
                else if (side == 'f') {
                    margin = 0;
                    tabIndex = 0;
                }
                else if (side == 'l') {
                    margin = _pullMargin($tab);
                }
                //d($tab);

                $lis
                    //.stop(false, true) //.stop( [ clearQueue ], [ jumpToEnd ] ) - this line is not working properly 
                    .animate({ 'margin-left': margin }, o.scrollSpeed, o.easing);

                if (o.selectTabAfterScroll && tabIndex !== null) {
                    $tabs.tabs({ active: tabIndex });
                    //_updateCurrentTab($tab);
                }
                else {
                    //Update current tab
                    if (tabIndex > -1) //Means this method is called from showTab event so tab css is already updated
                    {
                        //d($tab);
                        _updateCurrentTab($tab);
                        //d($curSelectedTab);
                    }
                }

                //Callback
                e = (typeof e == 'undefined') ? null : e;
                _callBackFnc(o.onTabScroll, e, $tab)

                //Finally stop the event
                if (e) {
                    e.preventDefault();
                }
            }

            function _addCustomerSelToCollection(col, nav) {
                var sel = o['customNav' + nav] || '';
                //Check for custom selector
                if (typeof sel == 'string' && $.trim(sel) != '') {
                    col = col.add(sel);
                }
                return col;
            }

            function _addNavEvents() {
                $navNext = $navNext ? $navNext : $();
                $navNext = _addCustomerSelToCollection($navNext, 'Next');

                //Handle next tab
                $navNext.click(function (e) {
                    var $nxtLi = $();
                    //First check if user do not want to select tab on Next than we have to find the next hidden (out of viewport) tab so we can scroll to it
                    if (!o.selectTabAfterScroll) {
                        $curSelectedTab.nextAll('li').each(function () {
                            //d($(this));
                            //d(_isHiddenOn('n', $(this)));
                            if (_isHiddenOn('n', $(this))) {
                                $nxtLi = $(this);
                                return false;
                            }
                        });
                    }
                    else {
                        $nxtLi = $curSelectedTab.next('li');
                    }
                    //return;

                    //check if there is no next tab
                    if (!$nxtLi.length) {
                        return false;
                    }

                    //check if li next to selected is in view or not
                    var isTabHidden = _isHiddenOn('n', $nxtLi);

                    //get index of next element
                    indexNextTab = $lis.index($nxtLi);

                    if (isTabHidden) {
                        _animateTabTo('n', $nxtLi, indexNextTab, e);
                    }
                    else {
                        $tabs.tabs({ active: indexNextTab });
                        //_updateCurrentTab($nxtLi);
                    }
                })


                //Handle previous tab
                $navPrev = $navPrev ? $navPrev : $();
                $navPrev = _addCustomerSelToCollection($navPrev, 'Prev');

                $navPrev.click(function (e) {
                    var $prvLi = $();

                    //First check if user do not want to select tab on Prev than we have to find the prev hidden (out of viewport) tab so we can scroll to it
                    if (!o.selectTabAfterScroll) {
                        //Reverse the order of tabs list
                        $($lis.get().reverse()).each(function () {
                            if (_isHiddenOn('p', $(this))) {
                                $prvLi = $(this);
                                return false;
                            }
                        });
                    }
                    else {
                        $prvLi = $curSelectedTab.prev('li');
                    }
                    //return; 

                    if (!$prvLi.length) {
                        return false;
                    }

                    //check if li previous to selected is in view or not
                    var isTabHidden = _isHiddenOn('p', $prvLi);

                    //Get index of prev element
                    var indexPrevTab = $lis.index($prvLi);

                    if (isTabHidden) {
                        _animateTabTo('p', $prvLi, indexPrevTab, e);
                    }
                    else {
                        $tabs.tabs({ active: indexPrevTab });
                        //_updateCurrentTab($prvLi);
                    }
                    return false;
                });

                //Handle First tab
                $navFirst = $navFirst ? $navFirst : $();
                $navFirst = _addCustomerSelToCollection($navFirst, 'First');
                $navFirst.click(function (e) {
                    //check if li selected is the first tab already
                    if ($lis.index($curSelectedTab) == 0) {
                        console.log('You are on first tab already');
                        return false;
                    }
                    _animateTabTo('f', $lis.first(), 0, e);
                    return false;
                });

                //Handle last tab
                $navLast = $navLast ? $navLast : $();
                $navLast = _addCustomerSelToCollection($navLast, 'Last');

                $navLast.click(function (e) {
                    //check if there is no next tab
                    var $lstLi = $curSelectedTab.next('li');
                    if (!$lstLi.length) {
                        return false;
                    }
                    //Get index of prev element
                    var indexLastTab = $("ul li", $tabs).length - 1;
                    _animateTabTo('l', $lis.last(), indexLastTab, e);
                    return false;
                });
            }

            function _updateCurrentTab($li) {
                //Remove current class from other tabs
                $ul.find('.stCurrentTab').removeClass('stCurrentTab');
                //Add class to the current tab to which it is scrolled and updated the variable
                $curSelectedTab = $li.addClass('stCurrentTab');
            }

            function _addclosebutton($li) {
                if (!o.closable) return;
                //If li is provide than just add to that, otherwise add to all
                var lis = $li || $lis;
                $.each(lis, function () {
                    var $thisLi = $(this).addClass('stHasCloseBtn');
                    $(this).append(
                        $('<span/>').addClass('ui-icon ui-icon-close stCloseBtn')
                                    .html('Close')
                                    .attr('title', o.closeTitle)
                                    .attr('role', 'presentation')
                                    .click(function (e) {
                                        var removeli = $(this).closest("li");
                                        var idx = $lis.index(removeli);
                                        _callBackFnc(o.onClose, e, removeli);
                                        var panelId = removeli.attr("aria-controls");
                                        removeli.remove();
                                        var removepan = $("#" + panelId);
                                        removepan.remove();
                                        $tabs.tabs('refresh2', 'remove', removeli, idx);
                                        removepan = null;
                                        removeli = null;
                                    })
                    )
                    //If width not assigned, the hidden tabs width cannot be calculated properly in _adjustLeftPosition
                    .width($thisLi.outerWidth())
                });
            }

            function _getNavPairWidth(single) {
                //Check if its visible
                if ($arrowsNav.css('visibility') == 'hidden') {
                    if ($navDrop)
                        return $navDrop.outerWidth();
                    else
                        return 0;
                }
                //If no nav than width is zero - take any of the nav say prev and multiply it with 2 IF we first/last nav are shown else with just 1 (its own width)
                var w = o.hideDefaultArrows ? 0 : $navPrev.outerWidth() * (o.showFirstLastArrows ? 2 : 1);
                if ($navDrop)
                    return (single ? w / 2 : w) + $navDrop.outerWidth();
                else
                    return single ? w / 2 : w;
            }

            function _adjustLeftPosition(single) {
                //If li is provided, find the left and width of second last (last is the new tab) tab and assign it to the new tab
                //if ($li) {
                //    if ($lis.lenght == 1) return;
                //    var $thisPrev = $li.prev('li') || $lis.first(),
                //        newLeft = parseFloat($thisPrev.css('left'));
                //    //d(newLeft);
                //    newLeft = isNaN(newLeft) ? 0 : newLeft;                    
                //    newLeft = newLeft + $thisPrev.outerWidth(true) + 4;
                //    //newLeft = newLeft + ($thisPrev.outerWidth(true) > $thisPrev.outerWidth() ? $thisPrev.outerWidth(true) : $thisPrev.outerWidth()) + 1; // modify by wayne
                //    //Assign
                //    $li.css({
                //        'left': newLeft,
                //        'margin-left': $thisPrev.css('margin-left')
                //    });
                //    return;
                //}

                //Add css class n take its left value to start the total width of tabs
                var pairWidth = _getNavPairWidth(single),
                    leftPush = pairWidth == 0 ? 6 : pairWidth + 5;
                $lis.first().addClass('stFirstTab').css({ 'left': leftPush, 'margin-left': 0 });
                var tw = leftPush;
                //Take left margin if any
                var leftMargin = parseFloat($lis.last().prev('li').css('margin-left'));
                if (leftMargin <= 0)
                    leftMargin = pairWidth;
                $ul.find('li:not(:first)').each(function () {
                    //Apply the css
                    $(this).css('margin-left', 0)[o.animateTabs ? 'animate' : 'css']({ 'left': tw += $(this).prev('li').outerWidth(true) })
                    //d($(this));
                });

                $lis.css('margin-left', leftMargin);
            }


            function _liWidth($tab) {
                var w = 0,
                list = $tab ? $tab.prevAll('li').andSelf() : $lis;
                list.each(function () {
                    w += $(this).outerWidth() + parseInt($(this).css('margin-right'), 10); //not outerWidth(true) because margin-left is changed in previous call so better take right margin which doesn't change in this plugin
                });

                var navWidth = $arrowsNav.css('visibility') == 'visible' ? _getNavPairWidth() : ($navDrop ? $navDrop.outerWidth() : 0);
                //d(navWidth);
                return w + navWidth;
            }

            _init();
        });
    }
})(jQuery);

//jQuery.extend(jQuery.easing, {
//    def: 'easeOutQuad',
//    easeInOutExpo: function (x, t, b, c, d) {
//        if (t == 0) return b;
//        if (t == d) return b + c;
//        if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
//        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
//    },
//    easeInBounce: function (x, t, b, c, d) {
//        return c - jQuery.easing.easeOutBounce(x, d - t, 0, c, d) + b;
//    }
//});
