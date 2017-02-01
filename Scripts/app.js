var SimpleCalculator = SimpleCalculator || {};
SimpleCalculator.Pages = SimpleCalculator.Pages || {};

// handles all of the page events and takes them to a handler if there is any
SimpleCalculator.Pages.Kernel = function (event) {
	var that = this,
		eventType = event.type,
		pageName = $(this).attr("data-simplecalculator-jspage");

	if (SimpleCalculator && SimpleCalculator.Pages && pageName && SimpleCalculator.Pages[pageName] && SimpleCalculator.Pages[pageName][eventType]) {
		SimpleCalculator.Pages[pageName][eventType].call(that);
	}};

// connects all the page events
SimpleCalculator.Events = function () {
	$("div[data-simplecalculator-jspage]").on(
		'pagebeforecreate pagecreate pagebeforeload pagebeforeshow pageshow pagebeforechange pagechange pagebeforehide pagehide pageinit',
		SimpleCalculator.Pages.Kernel).on(
		"pageinit", SimpleCalculator.hideAddressBar);
}();

//handler for all page events
SimpleCalculator.Pages.calculator = function(){
	var pageshow = function () {
		SimpleCalculator.Display.init($("#displayControl")[0]);
		$("button").tap(function(event){
			var key = $(this).attr("data-simplecalculator-tag"),
				id = this.id;
			event.preventDefault();

			switch(id){
				case "key0":
				case "key1":
				case "key2":
				case "key3":
				case "key4":
				case "key5":
				case "key6":
				case "key7":
				case "key8":
				case "key9":
				case "keyDecimalPoint":
					SimpleCalculator.Display.enterDigit(key);
					break;
				case "keyC":
					SimpleCalculator.Display.clearDisplay();
					break;
				case "keyBack":
					SimpleCalculator.Display.backButton();
					break;
				case "keyAdd":
					SimpleCalculator.Display.setOperator("+");
					break;
				case "keySubtract":
					SimpleCalculator.Display.setOperator("-");
					break;
				case "keyMultiply":
					SimpleCalculator.Display.setOperator("*");
					break;
				case "keyDivide":
					SimpleCalculator.Display.setOperator("/");
					break;
				case "keyEquals":
					SimpleCalculator.Display.setOperator("=");
					break;
			}
			return false;
		});
	},
	pagehide = function () {
		$("button").unbind("tap");
	};
	return {
		pageshow: pageshow,
		pagehide: pagehide
	};
}();

// Display means input type="text" above the buttons
SimpleCalculator.Display = function() {
	var $displayControl,
		operator,
		operatorSet = false,
		equalsPressed = false,
		accumulator = null,
		
		add = function(x, y) {
			return x + y;
		},
		divide = function(x, y) {
			if (y == 0) {
				alert("Can't divide by 0");
				return 0;
			}
			return x / y;
		},
		multiply = function(x, y) {
			return x * y;
		},
		subtract = function(x, y) {
			return x - y;
		},
		calculate = function() {
			if (!operator || accumulator == null) return;
			var currNumber = parseFloat($displayControl.value),
				newVal = 0;

			switch (operator) {
				case "%":
				newVal = percentage(accumulator, currNumber)
					break; 
				case "+":
					newVal = add(accumulator, currNumber);
					break;
				case "-":
					newVal = subtract(accumulator, currNumber);
					break;
				case "*":
					newVal = multiply(accumulator, currNumber);
					break;
				case "/":
					newVal = divide(accumulator, currNumber);
					break;
			}
			setValue(newVal);
			accumulator = newVal;
		},
		setValue = function(val) {
			$displayControl.value = val;
		},
		getValue = function(){
			return $displayControl.value + "";
		},
		// clears all the digits
		clearDisplay = function() {
			accumulator = null;
			equalsPressed = operatorSet = false;
			setValue("0");
		},
		//backbutton to remove last digit
		backButton = function(){
			var display = getValue();
			if(display){
				display = display.slice(0, display.length - 1);
				display = display? display: "0";
				setValue(display);
			}
		},
		//for a numeric or decimal point key being entered
		enterDigit = function(buttonValue) {
			var currentlyDisplayed = $displayControl.value;
			// keep the max digits=15
			if(currentlyDisplayed.length < 15){
				if (operatorSet == true || currentlyDisplayed === "0") {
					setValue("");
					operatorSet = false;
				}
				// already pressed a decimal point
				if(buttonValue === "." && currentlyDisplayed.indexOf(".")>= 0){
					return;
				}
				setValue($displayControl.value + buttonValue);
			}
		},
		setOperator = function(newOperator) {
			if (newOperator === "=") {
				equalsPressed = true;
				calculate();
				return;
			}
			if (!equalsPressed) calculate();
			equalsPressed = false;
			operator = newOperator;
			operatorSet = true;
			accumulator = parseFloat($displayControl.value);
		},
		init = function(currNumber) {
			$displayControl = currNumber;
		};
	return {
		clearDisplay: clearDisplay,
		backButton: backButton,
		enterDigit: enterDigit,
		setOperator: setOperator,
		init: init
	};
}();