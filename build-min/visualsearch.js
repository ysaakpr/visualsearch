/*
 VisualSearch.js 0.4.0
  (c) 2011 Samuel Clay, @samuelclay, DocumentCloud Inc.
  VisualSearch.js may be freely distributed under the MIT license.
  For all details and documentation:
  http://documentcloud.github.com/visualsearch
*/
(function(){var c=jQuery;window.VS||(window.VS={});VS.app||(VS.app={});VS.ui||(VS.ui={});VS.model||(VS.model={});VS.utils||(VS.utils={});VS.VERSION="0.5.0";VS.VisualSearch=function(a){var b={container:"",query:"",autosearch:!0,unquotable:[],remainder:"text",showFacets:!0,readOnly:!1,callbacks:{search:c.noop,focus:c.noop,blur:c.noop,facetMatches:c.noop,valueMatches:c.noop,clearSearch:c.noop,removedFacet:c.noop}};this.options=_.extend({},b,a);this.options.callbacks=_.extend({},b.callbacks,a.callbacks);
VS.app.hotkeys.initialize();this.searchQuery=new VS.model.SearchQuery;this.searchBox=new VS.ui.SearchBox({app:this,showFacets:this.options.showFacets});a.container&&(a=this.searchBox.render().el,c(this.options.container).html(a));this.searchBox.value(this.options.query||"");c(window).bind("unload",function(a){});return this};VS.init=function(a){return new VS.VisualSearch(a)}})();
(function(){var c=jQuery;VS.ui.SearchBox=Backbone.View.extend({id:"search",events:{"click .VS-cancel-search-box":"clearSearch","mousedown .VS-search-box":"maybeFocusSearch","dblclick .VS-search-box":"highlightSearch","click .VS-search-box":"maybeTripleClick"},initialize:function(a){this.options=_.extend({},this.options,a);this.app=this.options.app;this.flags={allSelected:!1};this.facetViews=[];this.inputViews=[];_.bindAll(this,"renderFacets","_maybeDisableFacets","disableFacets","deselectAllFacets",
"addedFacet","removedFacet","changedFacet");this.app.searchQuery.bind("reset",this.renderFacets).bind("add",this.addedFacet).bind("remove",this.removedFacet).bind("change",this.changedFacet);c(document).bind("keydown",this._maybeDisableFacets)},render:function(){c(this.el).append(JST.search_box({readOnly:this.app.options.readOnly}));c(document.body).setMode("no","search");return this},value:function(a){return null==a?this.serialize():this.setQuery(a)},serialize:function(){var a=[],b=this.inputViews.length;
this.app.searchQuery.each(_.bind(function(b,c){a.push(this.inputViews[c].value());a.push(b.serialize())},this));b&&a.push(this.inputViews[b-1].value());return _.compact(a).join(" ")},selected:function(){return _.select(this.facetViews,function(a){return"is"==a.modes.editing||"is"==a.modes.selected})},selectedModels:function(){return _.pluck(this.selected(),"model")},setQuery:function(a){this.currentQuery=a;VS.app.SearchParser.parse(this.app,a)},viewPosition:function(a){a=_.indexOf("facet"==a.type?
this.facetViews:this.inputViews,a);-1==a&&(a=0);return a},searchEvent:function(a){var b=this.value();this.focusSearch(a);this.value(b);this.app.options.callbacks.search(b,this.app.searchQuery)},addFacet:function(a,b,c){a=VS.utils.inflector.trim(a);b=VS.utils.inflector.trim(b||"");a&&(a=new VS.model.SearchFacet({category:a,value:b||"",app:this.app}),this.app.searchQuery.add(a,{at:c}))},addedFacet:function(a){this.renderFacets();var b=_.detect(this.facetViews,function(b){if(b.model==a)return!0});_.defer(function(){b.enableEdit()})},
changedFacet:function(){this.renderFacets()},removedFacet:function(a,b,c){this.app.options.callbacks.removedFacet(a,b,c)},renderFacets:function(){this.facetViews=[];this.inputViews=[];this.$(".VS-search-inner").empty();this.app.searchQuery.each(_.bind(this.renderFacet,this));this.renderSearchInput();this.renderPlaceholder()},renderFacet:function(a,b){var c=new VS.ui.SearchFacet({app:this.app,model:a,order:b});this.renderSearchInput();this.facetViews.push(c);this.$(".VS-search-inner").children().eq(2*
b).after(c.render().el);c.calculateSize();_.defer(_.bind(c.calculateSize,c));return c},renderSearchInput:function(){var a=new VS.ui.SearchInput({position:this.inputViews.length,app:this.app,showFacets:this.options.showFacets});this.$(".VS-search-inner").append(a.render().el);this.inputViews.push(a)},renderPlaceholder:function(){var a=this.$(".VS-placeholder");this.app.searchQuery.length?a.addClass("VS-hidden"):a.removeClass("VS-hidden").text(this.app.options.placeholder)},clearSearch:function(a){if(!this.app.options.readOnly){var b=
_.bind(function(){this.disableFacets();this.value("");this.flags.allSelected=!1;this.searchEvent(a);this.focusSearch(a)},this);this.app.options.callbacks.clearSearch!=c.noop?this.app.options.callbacks.clearSearch(b):b()}},selectAllFacets:function(){this.flags.allSelected=!0;c(document).one("click.selectAllFacets",this.deselectAllFacets);_.each(this.facetViews,function(a,b){a.selectFacet()});_.each(this.inputViews,function(a,b){a.selectText()})},allSelected:function(a){a&&(this.flags.allSelected=!1);
return this.flags.allSelected},deselectAllFacets:function(a){this.disableFacets();if(this.$(a.target).is(".category,input")){var b=c(a.target).closest(".search_facet,.search_input"),e=_.detect(this.facetViews.concat(this.inputViews),function(a){return a.el==b[0]});"facet"==e.type?e.selectFacet():"input"==e.type&&_.defer(function(){e.enableEdit(!0)})}},disableFacets:function(a){_.each(this.inputViews,function(b){!b||b==a||"is"!=b.modes.editing&&"is"!=b.modes.selected||b.disableEdit()});_.each(this.facetViews,
function(b){!b||b==a||"is"!=b.modes.editing&&"is"!=b.modes.selected||(b.disableEdit(),b.deselectFacet())});this.flags.allSelected=!1;this.removeFocus();c(document).unbind("click.selectAllFacets")},resizeFacets:function(a){_.each(this.facetViews,function(b,c){a&&b!=a||b.resize()})},_maybeDisableFacets:function(a){if(this.flags.allSelected&&"backspace"==VS.app.hotkeys.key(a))return a.preventDefault(),this.clearSearch(a),!1;this.flags.allSelected&&VS.app.hotkeys.printable(a)&&this.clearSearch(a)},focusNextFacet:function(a,
b,c){c=c||{};var f=this.facetViews.length,d=c.viewPosition||this.viewPosition(a);if(!c.skipToFacet)"text"==a.type&&0<b&&(b-=1),"facet"==a.type&&0>b&&(b+=1);else if(c.skipToFacet&&"text"==a.type&&f==d&&0<=b)return!1;var g,d=Math.min(f,d+b);"text"==a.type?(0<=d&&d<f?g=this.facetViews[d]:d==f&&(g=this.inputViews[this.inputViews.length-1]),g&&c.selectFacet&&"facet"==g.type?g.selectFacet():g&&(g.enableEdit(),g.setCursorAtEnd(b||c.startAtEnd))):"facet"==a.type&&(c.skipToFacet?d>=f||0>d?(g=_.last(this.inputViews),
g.enableEdit()):(g=this.facetViews[d],g.enableEdit(),g.setCursorAtEnd(b||c.startAtEnd)):(g=this.inputViews[d],g.enableEdit()));c.selectText&&g.selectText();this.resizeFacets();return!0},maybeFocusSearch:function(a){this.app.options.readOnly||(c(a.target).is(".VS-search-box")||c(a.target).is(".VS-search-inner")||"keydown"==a.type)&&this.focusSearch(a)},focusSearch:function(a,b){if(!this.app.options.readOnly){var c=this.inputViews[this.inputViews.length-1];c.enableEdit(b);b||c.setCursorAtEnd(-1);"keydown"==
a.type&&(c.keydown(a),c.box.trigger("keydown"));_.defer(_.bind(function(){this.$("input:focus").length||c.enableEdit(b)},this))}},highlightSearch:function(a){this.app.options.readOnly||!c(a.target).is(".VS-search-box")&&!c(a.target).is(".VS-search-inner")&&"keydown"!=a.type||(this.inputViews[this.inputViews.length-1].startTripleClickTimer(),this.focusSearch(a,!0))},maybeTripleClick:function(a){return this.inputViews[this.inputViews.length-1].maybeTripleClick(a)},addFocus:function(){this.app.options.readOnly||
(this.app.options.callbacks.focus(),this.$(".VS-search-box").addClass("VS-focus"))},removeFocus:function(){this.app.options.callbacks.blur();_.any(this.facetViews.concat(this.inputViews),function(a){return a.isFocused()})||this.$(".VS-search-box").removeClass("VS-focus")},showFacetCategoryMenu:function(a){a.preventDefault();a.stopPropagation();if(this.facetCategoryMenu&&"is"==this.facetCategoryMenu.modes.open)return this.facetCategoryMenu.close();a=[{title:"Account",onClick:_.bind(this.addFacet,this,
"account","")},{title:"Project",onClick:_.bind(this.addFacet,this,"project","")},{title:"Filter",onClick:_.bind(this.addFacet,this,"filter","")},{title:"Access",onClick:_.bind(this.addFacet,this,"access","")}];a=this.facetCategoryMenu||(this.facetCategoryMenu=new dc.ui.Menu({items:a,standalone:!0}));this.$(".VS-icon-search").after(a.render().open().content);return!1}})})();
(function(){var c=jQuery;VS.ui.SearchFacet=Backbone.View.extend({type:"facet",className:"search_facet",events:{"click .category":"selectFacet","keydown input":"keydown","mousedown input":"enableEdit","mouseover .VS-icon-cancel":"showDelete","mouseout .VS-icon-cancel":"hideDelete","click .VS-icon-cancel":"remove"},initialize:function(a){this.options=_.extend({},this.options,a);this.flags={canClose:!1};_.bindAll(this,"set","keydown","deselectFacet","deferDisableEdit");this.app=this.options.app},render:function(){c(this.el).html(JST.search_facet({model:this.model,
readOnly:this.app.options.readOnly}));this.setMode("not","editing");this.setMode("not","selected");this.box=this.$("input");this.box.val(this.model.label());this.box.bind("blur",this.deferDisableEdit);this.box.bind("input propertychange",this.keydown);this.setupAutocomplete();return this},calculateSize:function(){this.box.autoGrowInput();this.box.unbind("updated.autogrow");this.box.bind("updated.autogrow",_.bind(this.moveAutocomplete,this))},resize:function(a){this.box.trigger("resize.autogrow",a)},
setupAutocomplete:function(){this.box.autocomplete({source:_.bind(this.autocompleteValues,this),minLength:0,delay:0,autoFocus:!0,position:{offset:"0 5"},create:_.bind(function(a,b){c(this.el).find(".ui-autocomplete-input").css("z-index","auto")},this),select:_.bind(function(a,b){a.preventDefault();var c=this.model.get("value");this.set(b.item.value);if(c!=b.item.value||this.box.val()!=b.item.value)this.app.options.autosearch?this.search(a):(this.app.searchBox.renderFacets(),this.app.searchBox.focusNextFacet(this,
1,{viewPosition:this.options.order}));return!1},this),open:_.bind(function(a,b){var e=this.box;this.box.autocomplete("widget").find(".ui-menu-item").each(function(){var a=c(this);(a.data("item.autocomplete")||a.data("ui-autocomplete-item")).value==e.val()&&e.data("ui-autocomplete").menu.activate&&e.data("ui-autocomplete").menu.activate(new c.Event("mouseover"),a)})},this)});this.box.autocomplete("widget").addClass("VS-interface")},moveAutocomplete:function(){var a=this.box.data("ui-autocomplete");
a&&a.menu.element.position({my:"left top",at:"left bottom",of:this.box.data("ui-autocomplete").element,collision:"flip",offset:"0 5"})},searchAutocomplete:function(a){if(a=this.box.data("ui-autocomplete")){var b=a.menu.element;a.search();b.outerWidth(Math.max(b.width("").outerWidth(),a.element.outerWidth()))}},closeAutocomplete:function(){var a=this.box.data("ui-autocomplete");a&&a.close()},autocompleteValues:function(a,b){var e=this.model.get("category"),f=this.model.get("value"),d=a.term;this.app.options.callbacks.valueMatches(e,
d,function(a,e){e=e||{};a=a||[];if(d&&f!=d)if(e.preserveMatches)b(a);else{var h=VS.utils.inflector.escapeRegExp(d||""),k=new RegExp("\\b"+h,"i");a=c.grep(a,function(a){return k.test(a)||k.test(a.value)||k.test(a.label)})}e.preserveOrder?b(a):b(_.sortBy(a,function(a){return a==f||a.value==f?"":a}))})},set:function(a){a&&this.model.set({value:a})},search:function(a,b){b||(b=1);this.closeAutocomplete();this.app.searchBox.searchEvent(a);_.defer(_.bind(function(){this.app.searchBox.focusNextFacet(this,
b,{viewPosition:this.options.order})},this))},enableEdit:function(){this.app.options.readOnly||("is"!=this.modes.editing&&(this.setMode("is","editing"),this.deselectFacet(),""==this.box.val()&&this.box.val(this.model.get("value"))),this.flags.canClose=!1,this.app.searchBox.disableFacets(this),this.app.searchBox.addFocus(),_.defer(_.bind(function(){this.app.searchBox.addFocus()},this)),this.resize(),this.searchAutocomplete(),this.box.focus())},deferDisableEdit:function(){this.flags.canClose=!0;_.delay(_.bind(function(){this.flags.canClose&&
!this.box.is(":focus")&&"is"==this.modes.editing&&"is"!=this.modes.selected&&this.disableEdit()},this),250)},disableEdit:function(){var a=VS.utils.inflector.trim(this.box.val());a!=this.model.get("value")&&this.set(a);this.flags.canClose=!1;this.box.selectRange(0,0);this.box.blur();this.setMode("not","editing");this.closeAutocomplete();this.app.searchBox.removeFocus()},selectFacet:function(a){a&&a.preventDefault();if(!this.app.options.readOnly){var b=this.app.searchBox.allSelected();if("is"!=this.modes.selected){this.box.is(":focus")&&
(this.box.setCursorPosition(0),this.box.blur());this.flags.canClose=!1;this.closeAutocomplete();this.setMode("is","selected");this.setMode("not","editing");if(!b||a)c(document).unbind("keydown.facet",this.keydown),c(document).unbind("click.facet",this.deselectFacet),_.defer(_.bind(function(){c(document).unbind("keydown.facet").bind("keydown.facet",this.keydown);c(document).unbind("click.facet").one("click.facet",this.deselectFacet)},this)),this.app.searchBox.disableFacets(this),this.app.searchBox.addFocus();
return!1}}},deselectFacet:function(a){a&&a.preventDefault();"is"==this.modes.selected&&(this.setMode("not","selected"),this.closeAutocomplete(),this.app.searchBox.removeFocus());c(document).unbind("keydown.facet",this.keydown);c(document).unbind("click.facet",this.deselectFacet);return!1},isFocused:function(){return this.box.is(":focus")},showDelete:function(){c(this.el).addClass("search_facet_maybe_delete")},hideDelete:function(){c(this.el).removeClass("search_facet_maybe_delete")},setCursorAtEnd:function(a){-1==
a?this.box.setCursorPosition(this.box.val().length):this.box.setCursorPosition(0)},remove:function(a){var b=this.model.get("value");this.deselectFacet();this.disableEdit();this.app.searchQuery.remove(this.model);b&&this.app.options.autosearch?this.search(a,-1):(this.app.searchBox.renderFacets(),this.app.searchBox.focusNextFacet(this,-1,{viewPosition:this.options.order}))},selectText:function(){this.box.selectRange(0,this.box.val().length)},keydown:function(a){var b=VS.app.hotkeys.key(a);if("enter"==
b&&this.box.val())this.disableEdit(),this.search(a);else if("left"==b)"is"==this.modes.selected?(this.deselectFacet(),this.app.searchBox.focusNextFacet(this,-1,{startAtEnd:-1})):0!=this.box.getCursorPosition()||this.box.getSelection().length||this.selectFacet();else if("right"==b)"is"==this.modes.selected?(a.preventDefault(),this.deselectFacet(),this.setCursorAtEnd(0),this.enableEdit()):this.box.getCursorPosition()==this.box.val().length&&(a.preventDefault(),this.disableEdit(),this.app.searchBox.focusNextFacet(this,
1));else if(VS.app.hotkeys.shift&&"tab"==b)a.preventDefault(),this.app.searchBox.focusNextFacet(this,-1,{startAtEnd:-1,skipToFacet:!0,selectText:!0});else if("tab"==b)a.preventDefault(),this.app.searchBox.focusNextFacet(this,1,{skipToFacet:!0,selectText:!0});else{if(VS.app.hotkeys.command&&(97==a.which||65==a.which))return a.preventDefault(),this.app.searchBox.selectAllFacets(),!1;VS.app.hotkeys.printable(a)&&"is"==this.modes.selected?(this.app.searchBox.focusNextFacet(this,-1,{startAtEnd:-1}),this.remove(a)):
"backspace"==b&&(c(document).on("keydown.backspace",function(a){"backspace"===VS.app.hotkeys.key(a)&&a.preventDefault()}),c(document).on("keyup.backspace",function(a){c(document).off(".backspace")}),"is"==this.modes.selected?(a.preventDefault(),this.remove(a)):0!=this.box.getCursorPosition()||this.box.getSelection().length||(a.preventDefault(),this.selectFacet()),a.stopPropagation())}null==a.which?_.defer(_.bind(this.resize,this,a)):this.resize(a)}})})();
(function(){var c=jQuery;VS.ui.SearchInput=Backbone.View.extend({type:"text",className:"search_input ui-menu",events:{"keypress input":"keypress","keydown input":"keydown","keyup input":"keyup","click input":"maybeTripleClick","dblclick input":"startTripleClickTimer"},initialize:function(a){this.options=_.extend({},this.options,a);this.app=this.options.app;this.flags={canClose:!1};_.bindAll(this,"removeFocus","addFocus","moveAutocomplete","deferDisableEdit")},render:function(){c(this.el).html(JST.search_input({readOnly:this.app.options.readOnly}));
this.setMode("not","editing");this.setMode("not","selected");this.box=this.$("input");this.box.autoGrowInput();this.box.bind("updated.autogrow",this.moveAutocomplete);this.box.bind("blur",this.deferDisableEdit);this.box.bind("focus",this.addFocus);this.setupAutocomplete();return this},setupAutocomplete:function(){this.box.autocomplete({minLength:this.options.showFacets?0:1,delay:50,autoFocus:!0,position:{offset:"0 -1"},source:_.bind(this.autocompleteValues,this),focus:function(){return!1},create:_.bind(function(a,
b){c(this.el).find(".ui-autocomplete-input").css("z-index","auto")},this),select:_.bind(function(a,b){a.preventDefault();var c=this.addTextFacetRemainder(b.item.label||b.item.value);this.app.searchBox.addFacet(b.item instanceof String?b.item:b.item.value,"",this.options.position+(c?1:0));return!1},this)});this.box.data("ui-autocomplete")._renderMenu=function(a,b){var c="";_.each(b,_.bind(function(b,d){b.category&&b.category!=c&&(a.append('<li class="ui-autocomplete-category">'+b.category+"</li>"),
c=b.category);this._renderItemData?this._renderItemData(a,b):this._renderItem(a,b)},this))};this.box.autocomplete("widget").addClass("VS-interface")},autocompleteValues:function(a,b){var e=a.term.match(/\w+\*?$/),f=VS.utils.inflector.escapeRegExp(e&&e[0]||"");this.app.options.callbacks.facetMatches(function(a,e){e=e||{};a=a||[];var l=new RegExp("^"+f,"i"),h=c.grep(a,function(a){return a&&l.test(a.label||a)});e.preserveOrder?b(h):b(_.sortBy(h,function(a){return a.label?a.category+"-"+a.label:a}))})},
closeAutocomplete:function(){var a=this.box.data("ui-autocomplete");a&&a.close()},moveAutocomplete:function(){var a=this.box.data("ui-autocomplete");a&&a.menu.element.position({my:"left top",at:"left bottom",of:this.box.data("ui-autocomplete").element,collision:"none",offset:"0 -1"})},searchAutocomplete:function(a){if(a=this.box.data("ui-autocomplete")){var b=a.menu.element;a.search();b.outerWidth(Math.max(b.width("").outerWidth(),a.element.outerWidth()))}},addTextFacetRemainder:function(a){var b=
this.box.val(),c=b.match(/\b(\w+)$/);if(!c)return"";0==a.search(new RegExp(c[0],"i"))&&(b=b.replace(/\b(\w+)$/,""));(b=b.replace("^s+|s+$",""))&&this.app.searchBox.addFacet(this.app.options.remainder,b,this.options.position);return b},enableEdit:function(a){this.addFocus();a&&this.selectText();this.box.focus()},addFocus:function(){this.flags.canClose=!1;this.app.searchBox.allSelected()||this.app.searchBox.disableFacets(this);this.app.searchBox.addFocus();this.setMode("is","editing");this.setMode("not",
"selected");this.app.searchBox.allSelected()||this.searchAutocomplete()},disableEdit:function(){this.box.blur();this.removeFocus()},removeFocus:function(){this.flags.canClose=!1;this.app.searchBox.removeFocus();this.setMode("not","editing");this.setMode("not","selected");this.closeAutocomplete()},deferDisableEdit:function(){this.flags.canClose=!0;_.delay(_.bind(function(){this.flags.canClose&&!this.box.is(":focus")&&"is"==this.modes.editing&&this.disableEdit()},this),250)},startTripleClickTimer:function(){this.tripleClickTimer=
setTimeout(_.bind(function(){this.tripleClickTimer=null},this),500)},maybeTripleClick:function(a){if(!this.app.options.readOnly&&this.tripleClickTimer)return a.preventDefault(),this.app.searchBox.selectAllFacets(),!1},isFocused:function(){return this.box.is(":focus")},value:function(){return this.box.val()},setCursorAtEnd:function(a){-1==a?this.box.setCursorPosition(this.box.val().length):this.box.setCursorPosition(0)},selectText:function(){this.box.selectRange(0,this.box.val().length);this.app.searchBox.allSelected()?
this.setMode("is","selected"):this.box.focus()},search:function(a,b){b||(b=0);this.closeAutocomplete();this.app.searchBox.searchEvent(a);_.defer(_.bind(function(){this.app.searchBox.focusNextFacet(this,b)},this))},keypress:function(a){var b=VS.app.hotkeys.key(a);if("enter"==b)return this.search(a,100);if(VS.app.hotkeys.colon(a)){this.box.trigger("resize.autogrow",a);var b=this.box.val(),c=[];this.app.options.callbacks.facetMatches(function(a){c=a});var f=_.map(c,function(a){return a.label?a.label:
a});if(_.contains(f,b))return a.preventDefault(),a=this.addTextFacetRemainder(b),this.app.searchBox.addFacet(b,"",this.options.position+(a?1:0)),!1}else if("backspace"==b&&0==this.box.getCursorPosition()&&!this.box.getSelection().length)return a.preventDefault(),a.stopPropagation(),a.stopImmediatePropagation(),this.app.searchBox.resizeFacets(),!1},keydown:function(a){var b=VS.app.hotkeys.key(a);if("left"==b)0==this.box.getCursorPosition()&&(a.preventDefault(),this.app.searchBox.focusNextFacet(this,
-1,{startAtEnd:-1}));else if("right"==b)this.box.getCursorPosition()==this.box.val().length&&(a.preventDefault(),this.app.searchBox.focusNextFacet(this,1,{selectFacet:!0}));else if(VS.app.hotkeys.shift&&"tab"==b)a.preventDefault(),this.app.searchBox.focusNextFacet(this,-1,{selectText:!0});else if("tab"==b)if(b=this.box.val(),b.length){a.preventDefault();a=this.addTextFacetRemainder(b);var c=this.options.position+(a?1:0);b!=a&&this.app.searchBox.addFacet(b,"",c)}else this.app.searchBox.focusNextFacet(this,
0,{skipToFacet:!0,selectText:!0})&&a.preventDefault();else{if(VS.app.hotkeys.command&&"a"==String.fromCharCode(a.which).toLowerCase())return a.preventDefault(),this.app.searchBox.selectAllFacets(),!1;if("backspace"!=b||this.app.searchBox.allSelected())"end"==b?(b=this.app.searchBox.inputViews[this.app.searchBox.inputViews.length-1],b.setCursorAtEnd(-1)):"home"==b&&(b=this.app.searchBox.inputViews[0],b.setCursorAtEnd(-1));else if(0==this.box.getCursorPosition()&&!this.box.getSelection().length)return a.preventDefault(),
this.app.searchBox.focusNextFacet(this,-1,{backspace:!0}),!1}},keyup:function(a){this.box.trigger("resize.autogrow",a)}})})();(function(){var c=jQuery;Backbone.View.prototype.setMode=function(a,b){this.modes||(this.modes={});this.modes[b]!==a&&(c(this.el).setMode(a,b),this.modes[b]=a)}})();
(function(){var c=jQuery;VS.app.hotkeys={KEYS:{16:"shift",17:"command",91:"command",93:"command",224:"command",13:"enter",37:"left",38:"upArrow",39:"right",40:"downArrow",46:"delete",8:"backspace",35:"end",36:"home",9:"tab",188:"comma"},initialize:function(){_.bindAll(this,"down","up","blur");c(document).bind("keydown",this.down);c(document).bind("keyup",this.up);c(window).bind("blur",this.blur)},down:function(a){(a=this.KEYS[a.which])&&(this[a]=!0)},up:function(a){(a=this.KEYS[a.which])&&(this[a]=
!1)},blur:function(a){for(var b in this.KEYS)this[this.KEYS[b]]=!1},key:function(a){return this.KEYS[a.which]},colon:function(a){return(a=a.which)&&":"==String.fromCharCode(a)},printable:function(a){var b=a.which;if("keydown"==a.type){if(32==b||48<=b&&90>=b||96<=b&&111>=b||186<=b&&192>=b||219<=b&&222>=b)return!0}else if(32<=b&&126>=b||160<=b&&500>=b||":"==String.fromCharCode(b))return!0;return!1}}})();
(function(){VS.utils.inflector={trim:function(c){return c.trim?c.trim():c.replace(/^\s+|\s+$/g,"")},escapeRegExp:function(c){return c.replace(/([.*+?^${}()|[\]\/\\])/g,"\\$1")}}})();
(function(){var c=jQuery;c.fn.extend({setMode:function(a,b){b=b||"mode";var c=new RegExp("\\w+_"+b+"(\\s|$)","g"),f=null===a?"":a+"_"+b;this.each(function(){this.className=(this.className.replace(c,"")+" "+f).replace(/\s\s/g," ")});return f},autoGrowInput:function(){return this.each(function(){var a=c(this),b=c("<div />").css({opacity:0,top:-9999,left:-9999,position:"absolute",whiteSpace:"nowrap"}).addClass("VS-input-width-tester").addClass("VS-interface");a.next(".VS-input-width-tester").remove();
a.after(b);a.unbind("keydown.autogrow keypress.autogrow resize.autogrow change.autogrow").bind("keydown.autogrow keypress.autogrow resize.autogrow change.autogrow",function(c,f){f&&(c=f);var d=a.val();if("backspace"==VS.app.hotkeys.key(c)){var g=a.getCursorPosition();0<g&&(d=d.slice(0,g-1)+d.slice(g,d.length))}else VS.app.hotkeys.printable(c)&&!VS.app.hotkeys.command&&(d+=String.fromCharCode(c.which));d=d.replace(/&/g,"&amp;").replace(/\s/g,"&nbsp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");b.html(d);
a.width(b.width()+3+parseInt(a.css("min-width")));a.trigger("updated.autogrow")});a.trigger("resize.autogrow")})},getCursorPosition:function(){var a=0,b=this.get(0);if(document.selection){b.focus();var a=document.selection.createRange(),e=document.selection.createRange().text.length;a.moveStart("character",-b.value.length);a=a.text.length-e}else b&&c(b).is(":visible")&&null!=b.selectionStart&&(a=b.selectionStart);return a},setCursorPosition:function(a){return this.each(function(){return c(this).selectRange(a,
a)})},selectRange:function(a,b){return this.filter(":visible").each(function(){if(this.setSelectionRange)this.focus(),this.setSelectionRange(a,b);else if(this.createTextRange){var c=this.createTextRange();c.collapse(!0);c.moveEnd("character",b);c.moveStart("character",a);0<=b-a&&c.select()}})},getSelection:function(){var a=this[0];if(null!=a.selectionStart){var b=a.selectionStart,c=a.selectionEnd;return{start:b,end:c,length:c-b,text:a.value.substr(b,c-b)}}if(document.selection){var f=document.selection.createRange();
if(f)return a=a.createTextRange(),b=a.duplicate(),a.moveToBookmark(f.getBookmark()),b.setEndPoint("EndToStart",a),b=b.text.length,c=b+f.text.length,{start:b,end:c,length:c-b,text:f.text}}return{start:0,end:0,length:0}}})})();
(function(){VS.app.SearchParser={ALL_FIELDS:/('[^']+'|"[^"]+"|[^'"\s]\S*):\s*('[^']+'|"[^"]+"|[^'"\s]\S*)/g,CATEGORY:/('[^']+'|"[^"]+"|[^'"\s]\S*):\s*/,parse:function(c,a){var b=this._extractAllFacets(c,a);c.searchQuery.reset(b);return b},_extractAllFacets:function(c,a){for(var b=[],e=a;a;){var f,d,e=a,g=this._extractNextField(a);g?-1!=g.indexOf(":")?(f=g.match(this.CATEGORY)[1].replace(/(^['"]|['"]$)/g,""),d=g.replace(this.CATEGORY,"").replace(/(^['"]|['"]$)/g,""),a=VS.utils.inflector.trim(a.replace(g,
""))):-1==g.indexOf(":")&&(f=c.options.remainder,d=g,a=VS.utils.inflector.trim(a.replace(d,""))):(f=c.options.remainder,d=this._extractSearchText(a),a=VS.utils.inflector.trim(a.replace(d,"")));f&&d&&(g=new VS.model.SearchFacet({category:f,value:VS.utils.inflector.trim(d),app:c}),b.push(g));if(e==a)break}return b},_extractNextField:function(c){var a=c.match(/^\s*(\S+)\s+(?=('[^']+'|"[^"]+")('[^']+'|"[^"]+"|[^'"\s]\S*))/);return a&&1<=a.length?a[1]:this._extractFirstField(c)},_extractFirstField:function(c){return(c=
c.match(this.ALL_FIELDS))&&c.length&&c[0]},_extractSearchText:function(c){return VS.utils.inflector.trim((c||"").replace(this.ALL_FIELDS,""))}}})();
(function(){VS.model.SearchFacet=Backbone.Model.extend({serialize:function(){var c=this.quoteCategory(this.get("category")),a=VS.utils.inflector.trim(this.get("value")),b=this.get("app").options.remainder;if(!a)return"";_.contains(this.get("app").options.unquotable||[],c)||c==b||(a=this.quoteValue(a));return(c!=b?c+": ":"")+a},quoteCategory:function(c){var a=/"/.test(c),b=/'/.test(c),e=/\s/.test(c);return a&&!b?"'"+c+"'":e||b&&!a?'"'+c+'"':c},quoteValue:function(c){var a=/"/.test(c),b=/'/.test(c);
return a&&!b?"'"+c+"'":'"'+c+'"'},label:function(){return this.get("label")||this.get("value")}})})();
(function(){VS.model.SearchQuery=Backbone.Collection.extend({model:VS.model.SearchFacet,serialize:function(){return this.map(function(c){return c.serialize()}).join(" ")},facets:function(){return this.map(function(c){var a={};a[c.get("category")]=c.get("value");return a})},find:function(c){var a=this.detect(function(a){return a.get("category").toLowerCase()==c.toLowerCase()});return a&&a.get("value")},count:function(c){return this.select(function(a){return a.get("category").toLowerCase()==c.toLowerCase()}).length},
values:function(c){var a=this.select(function(a){return a.get("category").toLowerCase()==c.toLowerCase()});return _.map(a,function(a){return a.get("value")})},has:function(c,a){return this.any(function(b){var e=b.get("category").toLowerCase()==c.toLowerCase();return a?e&&b.get("value")==a:e})},withoutCategory:function(){var c=_.map(_.toArray(arguments),function(a){return a.toLowerCase()});return this.map(function(a){if(!_.include(c,a.get("category").toLowerCase()))return a.serialize()}).join(" ")}})})();
(function(){window.JST=window.JST||{};window.JST.search_box=_.template('<div class="VS-search <% if (readOnly) { %>VS-readonly<% } %>">\n  <div class="VS-search-box-wrapper VS-search-box">\n    <div class="VS-icon VS-icon-search"></div>\n    <div class="VS-placeholder"></div>\n    <div class="VS-search-inner"></div>\n    <div class="VS-icon VS-icon-cancel VS-cancel-search-box" title="clear search"></div>\n  </div>\n</div>');window.JST.search_facet=_.template('<% if (model.has(\'category\')) { %>\n  <div class="category"><%- model.get(\'category\') %>:</div>\n<% } %>\n\n<div class="search_facet_input_container">\n  <input type="text" class="search_facet_input ui-menu VS-interface" value="" <% if (readOnly) { %>disabled="disabled"<% } %> />\n</div>\n\n<div class="search_facet_remove VS-icon VS-icon-cancel"></div>');
window.JST.search_input=_.template('<input type="text" class="ui-menu" <% if (readOnly) { %>disabled="disabled"<% } %> />')})();
