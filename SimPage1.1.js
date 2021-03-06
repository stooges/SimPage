/**
 * @Author: liuchen 
 * 
 * -----------------------------------------        使用说明 （1）-（6）      -------------------------------------------
 * 
 * 	（1）后端使用mybatis的pagehelper插件；
 *	（2）后端使用 pagehelper 的 PageHelper.startPage(pageNum, pageSize) 方法；
 *	（3）服务器返回 paehelper的PageInfo的JSON对象；
 *  （4）CSS样式设置同 bootstrap 分页组件的样式设置一致；
 *	（5）例:
        <!-- JS代码 -->
        var sp=$("#pagePanel").SimPage({
	       url: '/ajax/route/route_routePage',  //*2* ajax访问的『url』 
	       requestNameOfPageNum:'pageNum',      //*3* 『request中的参数名』, 默认为'pageNum', 
                                                //	  用于从request中获取PageHelper.startPage(pageNum, pageSize)的参数pageNum 
	       requestNameOfPageSize:'pageSize',    //*4* 『request中的参数名』, 默认为'pageSize', 
                                                //	  用于从request中获取PageHelper.startPage(pageNum, pageSize)的参数pageSize 
           pageSize:10,                         //*5* 『页面大小』，默认值10
           data:{ },                            //*6* ajax访问的『其他参数』
           method:'post',                       //*7* 『请求方法』，默认为 post, 如果为 get 则上述参数也可放在url中 
           length:10,                           //*8* 页码面板中显示的『页码数量』，默认值10
           onPageChange:function(page){         //*9* 『回调函数』，页面切换时返回的页面数据
               alert(page['pageNum']);
               alert(page['pageSize']);
               alert(page['size']);
               alert(page['startRow']);
               alert(page['endRow']);
               alert(page['total']);
               alert(page['pages']);
               alert(page['list']); //数据列表
           }
        });
        <!-- HTML代码 -->
        <div id="pagePanel"></div> //存放页码面板的『容器id』 
 * （6）重要函数
       sp.refresh(pageNum, data)  //** 刷新页面，使用场景：页面删除、修改或添加一条记录后刷新页面
                                       //   pageNum为要显示的页面，默认为当前页面, data为ajax的访问数据, 含意同（5）中的 data
                                       //   该函数的两个参数在页面面要变动时使用，例：删除记录、输入检索条件进行搜索 
 * -----------------------------------------------------------------------------------------------------------------------
 **/

;(function($, window, document, undefined){
	$.fn.SimPage=function(options){
		if(!options["url"]){
			alert("A ajax url is needed!");
			return;
		}
		return new SimPage(this,options);
	};
	
	var SimPage=function($container,options){
		this.$container = $container;
		this.settings={//默认值
	       requestNameOfPageNum:'pageNum', 
	       requestNameOfPageSize:'pageSize', 
	       pageSize:10,
	       data:{ },
	       method:'post',
	       length:10,
	       onPageChange:function(page){}
		};
		$.extend(this.settings,options);
		
		this.startPage=1;
		this.endPage=this.settings['length'];
		//this.createPage(1);
		this.currentPage=1;
	};
	
	SimPage.prototype = {
		/**
		 * 根据url及参数，ajax访问，创建页面
		 */
		createPage : function(pageNum){
			var params= $.extend({},this.settings["data"]);
			params[this.settings['requestNameOfPageNum']]=pageNum;
			params[this.settings['requestNameOfPageSize']]=this.settings['pageSize'];
		
			var sp=this;
			$.ajax({
				url:this.settings['url'],
				type:this.settings['method'],
				data: params,
				dataType:"json",
				success:function (pageInfo){
					sp.createPanel(pageInfo);
					var userfunc=sp.settings['onPageChange'];
					userfunc(pageInfo);
				},
				error:function(request,message,error){
					alert("Server errors happend:"+message);
				}
			});
		},
		/**
		 * 创建页码面板,绑定事件
		 */
		createPanel : function(pageInfo){
			var totalPage=pageInfo['pages'];
			var currentPage=pageInfo['pageNum'];
			this.currentPage=currentPage;
			var length=this.settings['length'];
			
			/**调整页码显示*/
			if(pageInfo['pages']==0 || pageInfo['pages']==null){
				this.endPage=0;
			}else{
				if(currentPage==1){
					this.startPage=1;
					this.endPage=length<pageInfo['pages']?length:pageInfo['pages'];
				}
				if(currentPage==pageInfo['pages']){
					this.startPage=pageInfo['pages']-length+1;
					this.endPage=pageInfo['pages'];
				}
			}
			if(currentPage==this.startPage){
				this.startPage = currentPage-parseInt(length/2);
				if(this.startPage<=1)
					this.startPage=1;
				this.endPage=this.startPage+length-1;
				if (this.endPage>=pageInfo['pages'])
					this.endPage=pageInfo['pages'];
			}else if(this.endPage==currentPage){
				this.endPage = currentPage+parseInt(length/2);
				if(this.endPage>=pageInfo['pages'])
					this.endPage=pageInfo['pages'];
				this.startPage=this.endPage-length+1;
				if(this.startPage<=1)
					this.startPage=1;
			}
			
			/**创建页码面板*/
			var html = [];
			html.push('<div class="box-pager">');
			html.push('<div class="box-pagination">');
			html.push('<ul class="pagination">');
			if(pageInfo['isFirstPage']){
				html.push('<li class="disabled"><a href="javascript:;" class="first">首页</a></li>');
			}else{
				html.push('<li><a href="javascript:;" class="first">首页</a></li>');
			}
			if(pageInfo['hasPreviousPage']){
				html.push('<li><a href="javascript:;" class="prev">上页</a></li>');
			}else{
				html.push('<li class="disabled"><a href="javascript:;" class="prev">上页</a></li>');
			}

			for(var i=this.startPage;i<=this.endPage;i++){
				if(currentPage==i){
		            html.push('<li class="active"><a href="javascript:;">'+i+'</a></li>');
				}else{
					html.push('<li><a class="page" data-page="'+i+'" href="javascript:;">'+i+'</a></li>');
				}
			}
			if(pageInfo['hasNextPage']){
				html.push('<li><a class="next" href="javascript:;">下页</a></li>');
			}else{
				html.push('<li class="disabled"><a class="next" href="javascript:;">下页</a></li>');
			}
			if(pageInfo['isLastPage']){
				html.push('<li class="disabled"><a class="last" href="javascript:;">尾页</a></li>');
			}else{
				html.push('<li><a class="last" href="javascript:;">尾页</a></li>');
			}
			html.push('<li class="pagination-info">共 '+pageInfo['pages']+' 页 / '+pageInfo['total']+' 条</li>');
			html.push('<li class="pagination-info">每页');
			html.push('<select class="pagination-select">');
			html.push('<option value="10" selected="">10</option>');
			html.push('<option value="20">20</option>');
			html.push('<option value="50">50</option>');
			html.push('</select>条');
			html.push('</li></ul></div></div>');


			this.$container.html(html.join(''));
			
			sp=this;
			//绑定页码点击事件
			this.$container.find(".page").click(function(){
				sp.createPage($(this).data('page'));
			});
			//绑定首页点击事件
			this.$container.find(".first").click(function(){
				sp.createPage(1);
			});
			//绑定上页点击事件
			this.$container.find(".prev").click(function(){
				if(currentPage>1){
					sp.createPage(currentPage-1);
				}
			});
			//绑定下页点击事件
			this.$container.find(".next").click(function(){
				if(currentPage<totalPage){
					sp.createPage(currentPage+1);
				}
			});
			//绑定尾页点击事件
			this.$container.find(".last").click(function(){
				sp.createPage(totalPage);
			});
			//绑定选择显示条数事件
			this.$container.find('.pagination-select').change(function(){
				var pageSizeSelect = $(this).val();
				sp.refresh(1,{pageSize:pageSizeSelect});
			});
		},
		
		/**
		 * 刷新页面
		 * @pageNum: 要显示的页面，默认为当前页面
		 * @data: ajax访问的其他条件，默认为null，该参数在动态添加检索条件时用，例：页面有过滤功能时
		 * */
		refresh : function(pageNum, data){
			if(data!=null)
				this.settings['data']=data;
			if(pageNum==null)
				this.createPage(this.currentPage);
			else
				this.createPage(pageNum);
		}
	};
})($,window,document);
