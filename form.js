var FormDnD = {
		component:null,
};

!function(){
	var Flag = {
			//determine whether to replace or append
			isMenuCutInQueue: false, //replace
			isActivityDnD : false, //append
			isGroupActivityDnD: false,
			isMenuCutInGroupQueue: false,
			isRowActivityDnD: false,
			isMenuCutInRowQueue: false
	};
	
	var contentToBeDragged_next;
	
	
	FormDnD.init = function () {
		var formEdit = document.getElementById("form_edit");
		FormDnD.addMainEventsDnD(formEdit);
		
		var listItens = document.querySelectorAll('.draggable-component');
		[].forEach.call(listItens, function(item) {
			FormDnD.addMenuEventsDnD(item);
		});
	}
	
	/*
	 *  menu DnD
	 */
	FormDnD.menu_dragStart = function(e) {
//		var t = this.getCurrentTarget(e);
//		this.style.cursor = '-webkie-grabbing';
//		$(this).prop('style','cursor:-webkie-grabbing');
//		e.target.style.cursor = '-webkie-grabbing';
//		$(this).css({'cursor':'move'});
//		$(this).prop('style', 'cursor:-webkie-grabbing');
//		console.log($(this).css('cursor'));
//		var crt = this.cloneNode(true);
//		console.log(crt);
//		crt.style.boxShadow = "40px 40px 12px -2px rgba(20%,20%,40%,0.5)";
//		$(crt).css('box-shadow','2px 3px 2px 1px rgba(150,150,150,0.2 ), -2px 3px 2px 0px rgba(150,150,150,0.2 ), inset 1px 3px 2px white, inset 0 0 8px 1px #D9F5FF');
//		$(crt).css('background', 'gray');
//		$(crt).css('cursor', '-webkie-grab');
//		crt.style.cursor = "grab";
//		document.body.appendChild(crt);
//		e.dataTransfer.setDragImage(crt, 0, 0);
		
		dragSrcEl = this;
		e.dataTransfer.effectAllowed = 'grap';
		e.dataTransfer.setData('text', this.innerHTML);
		return true;
	}

	FormDnD.menu_dragEnter = function(e) {
		this.classList.add('over');
	}

	FormDnD.menu_dragLeave = function(e) {
		this.classList.remove('over');
	}

	FormDnD.menu_dragOver = function(e) {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'grap';
	}
	
	FormDnD.menu_dragEnd = function(e) {
		$('.drag-space').remove();
		var listItens = document.querySelectorAll('.draggable-component');
		[].forEach.call(listItens, function(item) {
			item.classList.remove('over');
		});
		e.stopPropagation();
		e.preventDefault();
		return false;
	}
	
	FormDnD.menu_dragDrop = function(e) {
		if (dragSrcEl != this) {
			dragSrcEl.innerHTML = this.innerHTML;
			this.innerHTML = e.dataTransfer.getData('text/html');
		}
		return false;
	}
	
	
	/*
	 * preordain DnD 
	 */
	FormDnD.preordain_dragLeave = function(e) {
		$('.drag-space').remove();
//		this.parentElement.removeChild(this);
	}
	
	FormDnD.preordain_dragDrop = function(e) {
		Flag.isMenuCutInQueue = true;
		
		e.preventDefault();
		if(Flag.isGroupActivityDnD) {
			Flag.isGroupActivityDnD = false; //initial value
			return false;
		}
		
		if(Flag.isActivityDnD) {
			$(this).replaceWith($(dragSrcEl));
			Flag.isActivityDnD = false; //initial value
		} else {
			this.removeEventListener('dragleave', FormDnD.preordain_dragLeave);
			this.setAttribute('class', (dragSrcEl.getAttribute('value') != -1 && dragSrcEl.getAttribute('value') != -2) 
					? 'draggable-activity' : 'draggable-activity-G');
			this.setAttribute('value', dragSrcEl.getAttribute('value'));
			this.setAttribute('draggable', 'true');
				this.innerHTML = Component.get(dragSrcEl.getAttribute('value'));
				
			this.removeEventListener('drop', FormDnD.preordain_dragDrop);
			FormDnD.addActivityEventsDnD(this);
			_actionAppend(this);
			
			if(this.getAttribute('value') == -1) 
				$(this).find('.group_context').on('drop', FormDnD.group_dragDrop);
			if(this.getAttribute('value') == -2)
				$(this).find('.row_context').on('drop', FormDnD.row_dragDrop);
		}
		
//		var newadd;
//		if(!Flag.isMenuCutInQueue) 
//			newadd = FormDnD.formAppend(dragSrcEl.getAttribute('value'));
//		Flag.isMenuCutInQueue = false; //initial value
//		
//		if(Flag.isActivityDnD) {
//			$(newadd).replaceWith($(dragSrcEl));
//			Flag.isActivityDnD = false; //initial value
//		}
	}
	
	FormDnD.preordainInnerGroup_dragLeave = function(e) {
		$('.drag-space').remove();
	}
	
	FormDnD.preordainInnerGroup_dragDrop = function(e) {
		Flag.isMenuCutInGroupQueue = true;
		
		if(Flag.isActivityDnD) {
			return false;
		}
		
		if(Flag.isGroupActivityDnD) {
			$(this).replaceWith($(dragSrcEl));
			Flag.isGroupActivityDnD = false; //initial value
		} else {
			var col_type = dragSrcEl.getAttribute('value');
			this.removeEventListener('dragleave', FormDnD.preordainInnerGroup_dragLeave);
			
			if(col_type == -1) {
				$(this).remove();
				return false;
			}
			
			this.setAttribute('class', (col_type != -2) ? 'draggable-activity' : 'draggable-activity-G');
			this.setAttribute('value', dragSrcEl.getAttribute('value'));
			this.setAttribute('draggable', 'true');
			this.innerHTML = Component.get(dragSrcEl.getAttribute('value'));
			FormDnD.addGroupInnerEventsDnD(this);
			_actionAppend(this);
		}
		
	}
	
	FormDnD.preordainInnerRow_dragLeave = function(e) {
		$('.drag-space').remove();
	}
	
	FormDnD.preordainInnerRow_dragDrop = function(e) {
		Flag.isMenuCutInRowQueue = true;
		
		if(Flag.isActivityDnD) {
			return false;
		}
		
		if(Flag.isRowActivityDnD) {
			$(this).replaceWith($(dragSrcEl));
			Flag.isRowActivityDnD = false; //initial value
		} else {
			var col_type = dragSrcEl.getAttribute('value');
			this.removeEventListener('dragleave', FormDnD.preordainInnerRow_dragLeave);
			
			if(col_type == -1 || col_type == -2) {
				$(this).remove();
				return false;
			}
			
			this.setAttribute('class', (col_type != -2) ? 'draggable-activity' : 'draggable-activity-G');
			this.setAttribute('value', dragSrcEl.getAttribute('value'));
			this.setAttribute('draggable', 'true');
			this.innerHTML = Component.get(dragSrcEl.getAttribute('value'));
			FormDnD.addRowInnerEventsDnD(this);
			_actionAppend(this);
		}
		
	}
	
	
	/*
	 * activity DnD
	 */
	FormDnD.activity_dragStart = function(e) {
		Flag.isActivityDnD = true;
//		this.style.cursor = '-webkit-grabbing';
		this.classList.add('draging');
		this.style.opacity = '0.4';
		dragSrcEl = this;
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/html', this.innerHTML);
		return true;
	}
	
	FormDnD.activity_dragEnter = function(e) {
		if(Flag.isGroupActivityDnD) {
			return false;
		}
		
		if(dragSrcEl != this && dragSrcEl.nextSibling != this) {
			if(this.getAttribute('class') != 'draggable-activity-G') {
//				$('.drag-space').remove();
//				var perordainDocument = document.createElement('div');
//				perordainDocument.setAttribute('class', 'drag-space');
//				if(dragSrcEl.getAttribute('value') != 10) 
//					perordainDocument.addEventListener('dragleave', FormDnD.preordain_dragLeave);
//				perordainDocument.addEventListener('drop', FormDnD.preordain_dragDrop);
//				this.parentElement.insertBefore(perordainDocument, this);
				
				FormDnD.appendPerO(dragSrcEl, this);
			}
		}
		
//		this.setAttribute('style', 'margin-top: 50px;');
	}
	
	FormDnD.activity_dragLeave = function(e) {
		this.setAttribute('style', '');
	}
	
	FormDnD.activity_dragOver = function(e) {
		var element = e.target;
		
		if(element.getAttribute('value') == '-1' || element.getAttribute('value') == '-2') {
			var position = element.getBoundingClientRect();
			var standard = position.top + 10;
			
			if(e.clientY < standard) {
//				$('.drag-space').remove();
//				var perordainDocument = document.createElement('div');
//				perordainDocument.setAttribute('class', 'drag-space');
//				if(dragSrcEl.getAttribute('value') != 10) 
//					perordainDocument.addEventListener('dragleave', FormDnD.preordain_dragLeave);
//				perordainDocument.addEventListener('drop', FormDnD.preordain_dragDrop);
//				this.parentElement.insertBefore(perordainDocument, this);
				
				FormDnD.appendPerO(dragSrcEl, this);
			}
		}
	}
	
	FormDnD.appendPerO = function(el, target) {
		$('.drag-space').remove();
		var perordainDocument = document.createElement('div');
		perordainDocument.setAttribute('class', 'drag-space');
		if(el.getAttribute('value') != -1) 
			perordainDocument.addEventListener('dragleave', FormDnD.preordain_dragLeave);
		perordainDocument.addEventListener('drop', FormDnD.preordain_dragDrop);
		target.parentElement.insertBefore(perordainDocument, target);
	}
	
	FormDnD.activity_dragEnd = function(e) {
		this.classList.remove("draging");
	}
	
	
	FormDnD.group_dragStart = function(e) {
		Flag.isGroupActivityDnD = true;
		
		this.classList.add('draging');
		this.style.opacity = '0.4';
		dragSrcEl = this;
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/html', this.innerHTML);
		return true;
	}
	
	FormDnD.group_dragEnter = function(e) {
		
		if(Flag.isActivityDnD) {
			return false;
		}
		
		if(dragSrcEl != this && dragSrcEl.nextSibling != this) {
			if(this.getAttribute('class') != 'draggable-activity-G') {
				$('.drag-space').remove();
				var perordainDocument = document.createElement('div');
				perordainDocument.setAttribute('class', 'drag-space');
				perordainDocument.addEventListener('dragleave', FormDnD.preordainInnerGroup_dragLeave);
				perordainDocument.addEventListener('drop', FormDnD.preordainInnerGroup_dragDrop);
				this.parentElement.insertBefore(perordainDocument, this);
			}
		}
	}
	
	FormDnD.group_dragLeave = function(e) {
		this.setAttribute('style', '');
	}
	
	FormDnD.group_dragEnd = function(e) {
		this.classList.remove("draging");
	}
	
	FormDnD.group_dragDrop = function(e) {
		e.preventDefault();
	    
		if(Flag.isActivityDnD) {
			Flag.isActivityDnD = false; //initial value
			return false;
		}
	    
		var newadd;
		if(!Flag.isMenuCutInGroupQueue && e.target.className.includes('group_context')) {
			if(dragSrcEl.getAttribute('value') != '-1') // group can't include group
				newadd = FormDnD.groupAppend(dragSrcEl.getAttribute('value'), e.target);
		}
		
		Flag.isMenuCutInGroupQueue = false; //initial value
		
		if(Flag.isGroupActivityDnD) {
			$(newadd).replaceWith($(dragSrcEl));
			Flag.isGroupActivityDnD = false; //initial value
		}
		$('.drag-space').remove();
		$('.group_context').sortable();
		return false;
	}
	
	
	FormDnD.row_dragStart = function(e) {
		Flag.isRowActivityDnD = true;
		
		this.classList.add('draging');
		this.style.opacity = '0.4';
		dragSrcEl = this;
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/html', this.innerHTML);
		return true;
	}
	
	FormDnD.row_dragEnter = function(e) {
		
		if(Flag.isActivityDnD) {
			return false;
		}
		
		if(dragSrcEl != this && dragSrcEl.nextSibling != this) {
			if(this.getAttribute('class') != 'draggable-activity-G') {
				$('.drag-space').remove();
				var perordainDocument = document.createElement('div');
				perordainDocument.setAttribute('class', 'drag-space');
				perordainDocument.addEventListener('dragleave', FormDnD.preordainInnerRow_dragLeave);
				perordainDocument.addEventListener('drop', FormDnD.preordainInnerRow_dragDrop);
				this.parentElement.insertBefore(perordainDocument, this);
			}
		}
	}
	
	FormDnD.row_dragLeave = function(e) {
		this.setAttribute('style', '');
	}
	
	FormDnD.row_dragEnd = function(e) {
		this.classList.remove("draging");
	}
	
	FormDnD.row_dragDrop = function(e) {
		e.preventDefault();
	    
		if(Flag.isActivityDnD) {
			Flag.isActivityDnD = false; //initial value
			return false;
		}
	    
		var newadd;
		if(!Flag.isMenuCutInRowQueue && e.target.className.includes('row_context')) {
			if(dragSrcEl.getAttribute('value') != '-1') // group can't include group
				newadd = FormDnD.rowAppend(dragSrcEl.getAttribute('value'), e.target);
		}
		
		Flag.isMenuCutInRowQueue = false; //initial value
		
		if(Flag.isRowActivityDnD) {
			$(newadd).replaceWith($(dragSrcEl));
			Flag.isRowActivityDnD = false; //initial value
		}
		$('.row_context').sortable();
		return false;
	}
	
	
	/*
	 * main DnD
	 */
	FormDnD.main_dragOver = function(e) {
		e.preventDefault();
		return false;
	}
	
	FormDnD.main_dragDrop = function(e) {
		e.preventDefault();
		if(Flag.isGroupActivityDnD) {
			Flag.isGroupActivityDnD = false; //initial value
			return false;
		}
		
		if(Flag.isRowActivityDnD) {
			Flag.isRowActivityDnD = false;
			return false;
		}
		
		var newadd;
		if(!Flag.isMenuCutInQueue) 
			newadd = FormDnD.formAppend(dragSrcEl.getAttribute('value'));
		
		Flag.isMenuCutInQueue = false; //initial value
		
		if(Flag.isActivityDnD) {
			$(newadd).replaceWith($(dragSrcEl));
			Flag.isActivityDnD = false; //initial value
		}
		
		if($(".tip").is(":visible"))
			$(".tip").hide();
		
		$('.drag-space').remove();
		return false;
	}
	
	FormDnD.formAppend = function(col_type) {
		var formActivity = document.getElementById('form_edit');

		if(col_type != -1 && col_type != -2) {
			var element_document = document.createElement('div');
			element_document.setAttribute('class', 'draggable-activity');
			element_document.setAttribute('value', col_type);
			element_document.setAttribute('draggable', 'true');
			FormDnD.addActivityEventsDnD(element_document);
			element_document.innerHTML = Component.get(col_type);
			
			formActivity.appendChild(element_document);
		} else {
			var element_document = document.createElement('div');
			element_document.setAttribute('class', 'draggable-activity-G');
			element_document.setAttribute('value', col_type);
			element_document.setAttribute('draggable', 'true');
			FormDnD.addActivityEventsDnD(element_document);
			element_document.innerHTML = Component.get(col_type);
			
			$(element_document).find('.group_context').on('mouseover', function(el) {
				FormDnD.removeActivityEventsDnD(element_document);
			});
			
			$(element_document).find('.group_context').on('mouseleave', function(el) {
				FormDnD.addActivityEventsDnD(element_document);
			});
			
			
//			FormDnD.addGroupEventsDnD($(element_document).find('.group_context'));
			$(element_document).find('.group_context').on('drop', FormDnD.group_dragDrop);
			$(element_document).find('.row_context').on('drop', FormDnD.row_dragDrop);
			
			formActivity.appendChild(element_document);
		}
		
		_actionAppend(element_document);
		
		return element_document;
	}
	
	FormDnD.groupAppend = function(col_type, target) {
		
		if(col_type != -1) {

			var element_document = document.createElement('div');
			element_document.setAttribute('class', (col_type != -2) ? 'draggable-activity' : 'draggable-activity-G');
			element_document.setAttribute('value', col_type);
			element_document.setAttribute('draggable', 'true');
			FormDnD.addGroupInnerEventsDnD(element_document);
			
			element_document.innerHTML = Component.get(col_type);
			target.appendChild(element_document);
			
			if(col_type == -2)
				$(element_document).find('.row_context').on('drop', FormDnD.row_dragDrop);
			
			_actionAppend(element_document);
		}
		
		return element_document;
	}
	
	FormDnD.rowAppend = function(col_type, target) {
		if(col_type != -1 || col_type != -2) {
			var element_document = document.createElement('div');
			element_document.setAttribute('class', 'draggable-activity');
			element_document.setAttribute('value', col_type);
			element_document.setAttribute('draggable', 'true');
			FormDnD.addRowInnerEventsDnD(element_document);
			
			element_document.innerHTML = Component.get(col_type);
			target.appendChild(element_document);
			
			_actionAppend(element_document);
		}
		
		return element_document;
	}
	
	function _actionAppend(parentElement) {
		$('.draggable-activity input').prop('disabled', true);
		$('.draggable-activity textarea').prop('disabled', true);
		$('.draggable-activity select').prop('disabled', true);
		
		var defColType = parentElement.getAttribute('value');
		var actionHtml = 
			    "<div class='action-button'>" + ((defColType == -2) ? "" :
					"<a href='#' class='edit'><span class='glyphicon glyphicon-pencil'></span></a>") + 
					"<a href='#' class='delete'><span class='glyphicon glyphicon-remove'></span></a>" +
				"</div> ";
//		 "<div class='action-button'>" +
//			"<a href='#' class='edit' onClick='templateDetail(this)' data-value='"+defColType+"'><span class='glyphicon glyphicon-pencil'></span></a>" +
//			"<a href='#' class='delete'><span class='glyphicon glyphicon-remove'></span></a>" +
//		"</div> "
		$(parentElement).append(actionHtml);
	}
	
	function _showAction() {
		$(this).find(".action-button").show();
	}
	
	function _hideAction() {
		$(this).find(".action-button").hide();
	}
	
	/*
	 * Events 
	 */
	FormDnD.addMenuEventsDnD = function (el) {
		el.addEventListener('dragstart', this.menu_dragStart, false);
//		el.addEventListener('dragenter', this.menu_dragEnter, false);
		el.addEventListener('dragover', this.menu_dragOver, false);
		el.addEventListener('dragleave', this.menu_dragLeave, false);
//		el.addEventListener('drop', this.menu_dragDrop, false);
		el.addEventListener('dragend', this.menu_dragEnd, false);
	}
	
	FormDnD.addMainEventsDnD = function (el) {
		el.addEventListener('dragover', this.main_dragOver, false);
		el.addEventListener('drop', this.main_dragDrop, false);
	}
	
	FormDnD.addActivityEventsDnD = function (el) {
		el.addEventListener('dragstart', FormDnD.activity_dragStart);
		el.addEventListener('dragenter', FormDnD.activity_dragEnter);
		el.addEventListener('dragover', FormDnD.activity_dragOver);
		el.addEventListener('dragleave', FormDnD.activity_dragLeave);
		el.addEventListener('dragend', FormDnD.activity_dragEnd);
		
		el.addEventListener('mouseover', _showAction);
		el.addEventListener('mouseleave', _hideAction);
	}
	
	FormDnD.removeActivityEventsDnD = function (el) {
		el.removeEventListener('dragstart', FormDnD.activity_dragStart);
		el.removeEventListener('dragover', FormDnD.activity_dragOver);
		el.removeEventListener('dragleave', FormDnD.activity_dragLeave);
		el.removeEventListener('dragend', FormDnD.activity_dragEnd);
	}
	
	FormDnD.addGroupInnerEventsDnD = function (el) {
		el.addEventListener('dragstart', FormDnD.group_dragStart);
		el.addEventListener('dragenter', FormDnD.group_dragEnter);
		el.addEventListener('dragover', FormDnD.group_dragOver);
		el.addEventListener('dragleave', FormDnD.group_dragLeave);
		el.addEventListener('dragend', FormDnD.group_dragEnd);
	}
	
	FormDnD.addGroupEventsDnD = function (el) {
//		el.addEventListener('drastart', FormDnD.group_dragStart, false);
//		el.addEventListener('dragover', FormDnD.group_dragOver, false);
//		el.addEventListener('dragleave', FormDnD.group_dragLeave, false);
//		el.addEventListener('dragend', FormDnD.group_dragEnd);
		el.addEventListener('drop', FormDnD.group_dragDrop, false);
	}
	
	FormDnD.addRowInnerEventsDnD = function (el) {
		el.addEventListener('dragstart', FormDnD.row_dragStart);
		el.addEventListener('dragenter', FormDnD.row_dragEnter);
		el.addEventListener('dragleave', FormDnD.row_dragLeave);
		el.addEventListener('dragend', FormDnD.row_dragEnd);
	}
	
	FormDnD.addRowEventsDnD = function (el) {
		el.addEventListener('drop', FormDnD.row_dragDrop, false);
	}
}();