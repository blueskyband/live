
function MyPage () {
	var canvas = $("#probability_pie_chart")[0];
	var ctx = probability_pie_chart.getContext("2d");
	var $my_pie_chart = $(".my_pie_chart");
	var per = 0;
	var color = "#0E5793";
	sim_init()
	var pieChart = new myPieChart()
	start_overlay()
	sim_nav()
	layoutChanger()
	input_plan_name()

	/*setTimeout(function () {
		pieChart.changePer(68)
	}, 2000)*/

	function sim_nav () {
		// slick
		$(".chart_change_wrap_inner").slick({arrows:false}).on("afterChange", function (_slick, _current) {
			var currentIndex = _current.currentSlide;
			$(".sim_chart_nav a").removeClass("current");
			$("#chart_nav_"+currentIndex).addClass("current")
		});

		$(".sim_chart_nav li a").on("click", function (e) {
			e.preventDefault();
			/*var pers = Number(this.id.replace("chart_nav_", "") * -740) + "px";
			$(".chart_change_wrap_inner").css("transform", "translateX("+pers+")");*/
			var currentIndex = Number(this.id.replace("chart_nav_", ""));
			$(".chart_change_wrap_inner").slick("slickGoTo", currentIndex)
			$(".sim_chart_nav li a").removeClass("current");
			$(this).addClass("current");
		})
	}

	function layoutChanger () {
		$(".panel_ctrl a").on("click", function (e) {
			e.preventDefault();
			$(".panel_ctrl a").removeClass("current");
			$(this).addClass("current");
			if($(this).hasClass("panel_left")) {
				$("body").addClass("layout_reverse");
			}else{
				$("body").removeClass("layout_reverse");
			}
		})
	}

	function myPieChart () {
		var baseColor = "#0E5793";
		var PROBABILITY_LIMIT = {min: 65, max: 95}; // この値を下回った目標達成確率は、見直しを進めるアラートを出す
		var self = this;
		//$(this).closest(".plan_item_box").css({"transition-delay": i*.3 + "s"});
		//$(this).find(".probability_percent").data("per", Math.floor(Math.random()*100))
		var w = canvas.width,
		h = canvas.height,
		r = 100,
		perDom = $my_pie_chart.find(".probability_percent")[0];
		$(".plans_container").addClass("show_item");

		initDraw()

		function renderStart (_num) {
			$(".probability_percent").show();
			per = 0;
			color = baseColor,
			target = _num,
			target360 = target / 100 * 360,
			txtNum = 0;
			ctx.save();
			ctx.clearRect(0,0,w,h)
			ctx.translate(w/2, h/2);
			ctx.rotate(-90 * Math.PI / 180);
			$my_pie_chart.removeClass("over95 under65")
			if(PROBABILITY_LIMIT.min > target) {
				color = "#B41419";
				$my_pie_chart.addClass("under65");
			}
			if(target >= PROBABILITY_LIMIT.max) {
				$my_pie_chart.addClass("over95")
			}
			
			$(".sim_main_common_container").css("opacity", 1);
			var timer_id = setInterval(function () {
				per += (target360 - per) * 0.07;
				txtNum += (target - txtNum) * 0.1;
				draw()
				renderText(txtNum)
				if(Math.abs(target - txtNum) < .5) {
					clearInterval(timer_id)
					renderText(target)
					animationEnd()
				}
			}, 10)
		}

		this.changePer = function (_num) {
			$("body").removeClass("show_loading show_re_calc");
			setTimeout(function () {
				$(".probability_percent").attr("data-per", _num)
				renderStart(_num)
			}, 1000)
			
		}

		function renderText (_txtNum) {
			perDom.innerText = parseInt(_txtNum);
		}

		function draw () {
			ctx.clearRect(0, 0, w, h);
			ctx.beginPath();
			ctx.strokeStyle = "#E8E8E8"
			ctx.lineWidth = 28;
			ctx.arc(0, 0, r, 0, 360 * Math.PI / 180, false);
			ctx.stroke();
			ctx.beginPath();
			ctx.strokeStyle = color;
			ctx.lineWidth = 20;
			ctx.lineCap = "round"
			var endA = per * Math.PI / 180;
			ctx.arc(0, 0, r, 0, endA, false);
			ctx.stroke();
		}


		function initDraw () {
			//$(".probability_percent").hide();
			ctx.save();
			ctx.clearRect(0,0,w,h)
			ctx.translate(w/2, h/2);
			ctx.rotate(-90 * Math.PI / 180);
			ctx.clearRect(0, 0, w, h);
			ctx.beginPath();
			ctx.strokeStyle = "#E8E8E8"
			ctx.lineWidth = 28;
			ctx.arc(0, 0, r, 0, 360 * Math.PI / 180, false);
			ctx.stroke();
			ctx.restore();
		}

		function animationEnd() {
			ctx.restore();
			completeCountUp()
		}
	}

	function completeCountUp () { // カウントアップが終わったら呼び出す処理
		// 数値によって、ボタンなどの表示内容を変更する
		var val = Number($(".probability_percent").attr("data-per"))
		//console.log($(".probability_percent"))
		var body = $("body")
		//var expectation_value = $(".expectation_value")
		body.removeClass("result_failed result_more result_pass")
		/*expectation_value.removeClass("alert_val");
		expectation_value.find(".expectation_value_num").text(val)*/
		//console.log(val)
		//この資産計画で良ければ「口座開設手続きへ」進みましょう。
		if(val < 65) { // 65%未満だったら
			$(".review_message .message_content").html("目標、投資金額、運用戦略を修正して、目標達成確率を80％以上にしましょう。")
			body.addClass("result_failed")
			
		} else if(val >=65 && 94 >= val) { // 65%〜94%だったら
			$(".review_message .message_content").html("この資産計画で良ければ「口座開設手続きへ」進みましょう。")
			body.addClass("result_pass")
			$(".to_next").prop("disabled", false);
		} else { // 95%以上だったら
			$(".review_message .message_content").html("目標達成確率は80〜94％をおすすめしています。目標、投資金額、運用戦略を修正してみましょう。")
			body.addClass("result_more")
			$(".to_next").prop("disabled", false);
		}
		$(".review_message").removeClass("hide");
	}

	function start_overlay() {
		$(".sim_start").on("click", function () {
			$(".start_overlay").addClass("do_start");
			setTimeout(function () {
				$(".main_container").addClass("app_ready");
			}, 2000)
			
		})
	}

	function sim_init () {
		$(document).on("input", ".ctrl_container input", function () {
			$(".re_calc").prop("disabled", false)
		})
		$(document).on("change", ".ctrl_container input", function () {
			$("body").addClass("show_re_calc");
			//$(".to_next, .to_review_point").prop("disabled", true);//「見直しポイント、次へ」ボタンを無効に
		})
		$(".re_calc").on("click", function () {

			$(".review_message").addClass("hide");
			$(".to_next").prop("disabled", true);
			//再計算
			//$(".to_next, .to_review_point").prop("disabled", false);//「見直しポイント、次へ」ボタンを有効に
			$("body").addClass("show_loading");
			setTimeout(function () {
				if($(".first_step_input_plan_name").is(':visible')) {
				$(".first_step_input_plan_name").hide();
			}
			},200)
			// A-Solutions さま
			// このsetTimeoutはダミーのコードで、2秒後にローディングが終わったことを想定してつくっています。
			// 実装時には外してください。
			setTimeout(function () {
				var pr = Math.floor(Math.random()*100)
				pieChart.changePer(pr)
			}, 2000)
		})
		$(".review_message .btn_close").on("click", function (e) {
			$(".review_message").addClass("hide");
		})

		$("input").on("click", function (e) {
			try {
				// ここでiosで全選択させるように処理
				e.target.setSelectionRange(0, e.target.value.length);
			} catch (exc) {
				// PCでは、input[type="number"]とかだとエラーになるので、ここは便利な関数を使う
				$(e.target).select();
			}
		})

	}

	function input_plan_name () {
		var btn_decide_name = $(".btn_decide_name");
		var input_plan_name_container = $(".input_plan_name_container")
		$(".my_plan_name").on("change input", function () {
			var txt_length = this.value.length;
			if(txt_length <= 12 && txt_length >= 3) {
				input_plan_name_container.addClass("enable_next")
				btn_decide_name.attr("disabled", false)
			}else{
				input_plan_name_container.removeClass("enable_next")
				btn_decide_name.attr("disabled", true)
			}
		})
		btn_decide_name.on("click", function () {
			//console.dir(this)
			if(!btn_decide_name.attr("disabled")) {
				$(".input_plan_name_elem").val($(".my_plan_name").val())
				$(".tit_edit_area").removeClass("hide")
				$(".first_step_input_plan_name_inner").addClass("hide");
				$(".good_plan_name").text($(".my_plan_name").val())
				setTimeout(function () {
					$(".second_step_input_num_navigator").removeClass("hide");
				},100)
			}
			
		})
	}

	(function simulation_page_settings () {
		// TODO: ASOL様
		// デモHTMLではURLパラメータに計画タイプを記述してアクセスすると、body要素にdata属性を引渡し、それに基づきXHRオブジェクトでサイドカラムのHTMLをインクルードする仕組みになっていますが、ASOL様の実装仕様に応じて以下は修正していただければ結構です。	
		var planType = getUTLParams();
		$("body").attr("data-plantype", planType)
		var type_selector = $("body").attr("data-plantype").replace("type_", "");
		var type_module_url = "modules_simulation_"+type_selector+".html";

		$(".ctrl_container").load(type_module_url, function () {
			$(".risk_slider").slider({
				min: 1,
				max: 8,
				step: 1,
				slide: function (e, ui) {
					var risk_num = ui.value
					$(".risk_slider_nums span").removeClass("current")
					$(".risk_slider_nums span:nth-child("+(risk_num + 1)+")").addClass("current")
				},
				create: function (e, ui) {
					$(".ui-slider-handle").removeAttr("tabindex")
				},
				change: function () {
					//block("<i class='spin'></i>", "#chartdiv")
				}
			})
		})

		function getUTLParams () {
			var urlParam = location.search.substring(1);
			if(urlParam) {
			  var param = urlParam.split('&');
			  var paramArray = [];
			  for (i = 0; i < param.length; i++) {
			    var paramItem = param[i].split('=');
			    paramArray[paramItem[0]] = paramItem[1];
			  }
			  return paramArray.plantype;
			}
		}
	})();
}

window.onload = MyPage;
