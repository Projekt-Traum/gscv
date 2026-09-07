{
	class Details {
		constructor() {
			this.DOM = {};

			const detailsTmpl = `
			<div class="details__bg details__bg--down">
				<button class="details__close"><i class="fas fa-2x fa-times icon--cross tm-fa-close"></i></button>
				<div class="details__description"></div>
			</div>						
			`;

			this.DOM.details = document.createElement('div');
			this.DOM.details.className = 'details';
			this.DOM.details.innerHTML = detailsTmpl;
			// DOM.content.appendChild(this.DOM.details);
			document.getElementById('tm-wrap').appendChild(this.DOM.details);
			this.init();
		}
		init() {
			this.DOM.bgDown = this.DOM.details.querySelector('.details__bg--down');
			this.DOM.description = this.DOM.details.querySelector('.details__description');
			this.DOM.close = this.DOM.details.querySelector('.details__close');

			this.initEvents();
		}
		initEvents() {
			// close page when outside of page is clicked.
			document.body.addEventListener('click', () => this.close());
			// prevent close page when inside of page is clicked.
			this.DOM.bgDown.addEventListener('click', function(event) {
							event.stopPropagation();
						});
			// close page when cross button is clicked.
			this.DOM.close.addEventListener('click', () => this.close());
		}
		fill(info) {
			// fill current page info
			this.DOM.description.innerHTML = info.description;
		}		
		getProductDetailsRect(){
			var p = 0;
			var d = 0;

			try {
				p = this.DOM.productBg.getBoundingClientRect();
				d = this.DOM.bgDown.getBoundingClientRect();	
			}
			catch(e){}

			return {
				productBgRect: p,
				detailsBgRect: d
			};
		}
		open(data) {
			if(this.isAnimating) return false;
			this.isAnimating = true;

			this.DOM.details.style.display = 'block';  

			this.DOM.details.classList.add('details--open');

			this.DOM.productBg = data.productBg;

			this.DOM.productBg.style.opacity = 0;

			const rect = this.getProductDetailsRect();

			this.DOM.bgDown.style.transform = `translateX(${rect.productBgRect.left-rect.detailsBgRect.left}px) translateY(${rect.productBgRect.top-rect.detailsBgRect.top}px) scaleX(${rect.productBgRect.width/rect.detailsBgRect.width}) scaleY(${rect.productBgRect.height/rect.detailsBgRect.height})`;
            this.DOM.bgDown.style.opacity = 1;

            // animate background
            anime({
                targets: [this.DOM.bgDown],
                duration: (target, index) => index ? 800 : 250,
                easing: (target, index) => index ? 'easeOutElastic' : 'easeOutSine',
                elasticity: 250,
                translateX: 0,
                translateY: 0,
                scaleX: 1,
                scaleY: 1,                              
                complete: () => this.isAnimating = false
            });

            // animate content
            anime({
                targets: [this.DOM.description],
                duration: 1000,
                easing: 'easeOutExpo',                
                translateY: ['100%',0],
                opacity: 1
            });

            // animate close button
            anime({
                targets: this.DOM.close,
                duration: 250,
                easing: 'easeOutSine',
                translateY: ['100%',0],
                opacity: 1
            });

            this.setCarousel();

            window.addEventListener("resize", this.setCarousel);
		}
		close() {
			if (!this.DOM.details.classList.contains('details--open')) {
				return false;
			}
			if(this.isAnimating) return false;
			this.isAnimating = true;

			this.DOM.details.classList.remove('details--open');

			if (document.activeElement) {
				document.activeElement.blur();
			}

			anime({
                targets: this.DOM.close,
                duration: 250,
                easing: 'easeOutSine',
                translateY: '100%',
                opacity: 0
            });

            anime({
                targets: [this.DOM.description],
                duration: 20,
                easing: 'linear',
                opacity: 0
            });

            const rect = this.getProductDetailsRect();
            anime({
                targets: [this.DOM.bgDown],
                duration: 250,
                easing: 'easeOutSine',                
                translateX: rect.productBgRect.left - rect.detailsBgRect.left,
                translateY: rect.productBgRect.top - rect.detailsBgRect.top,
                scaleX: rect.productBgRect.width / rect.detailsBgRect.width,
                scaleY: rect.productBgRect.height / rect.detailsBgRect.height,
                complete: () => {
                    this.DOM.bgDown.style.opacity = 0;
                    this.DOM.bgDown.style.transform = 'none';
                    this.DOM.productBg.style.opacity = '';
                    this.DOM.details.style.display = 'none';                    
                    this.isAnimating = false;
                }
            });
		}
		// Slick Carousel
        setCarousel() {
          
	        var slider = $('.details .tm-img-slider');

	        if(slider.length) { // check if slider exist

		        if (slider.hasClass('slick-initialized')) {
		            slider.slick('destroy');
		        }

		        if($(window).width() > 767){
		            // Slick carousel
		            slider.slick({
		                dots: true,
		                infinite: true,
		                slidesToShow: 4,
		                slidesToScroll: 3
		            });
		        }
		        else {
		            slider.slick({
			            dots: true,
			            infinite: true,
			            slidesToShow: 2,
			            slidesToScroll: 1
		        	});
		     	}	
	        }          
        }
	}; // class Details

	class Item {
		constructor(el) {
			this.DOM = {};
			this.DOM.el = el;
			this.DOM.product = this.DOM.el.querySelector('.product');
			this.DOM.productBg = this.DOM.product.querySelector('.product__bg');

			this.info = {
				description: this.DOM.product.querySelector('.product__description').innerHTML
			};

			this.initEvents();
		}
		initEvents() {
			this.DOM.product.addEventListener('click', (event) => {
				event.stopPropagation();
				this.open();
			});
		}
		open() {
			const focusIframe = (overlay) => {
				if (!overlay) return;
				const iframe = overlay.querySelector('iframe');
				if (iframe) {
					setTimeout(() => {
						try {
							iframe.focus();
							if (iframe.contentWindow) iframe.contentWindow.focus();
						} catch (e) { }
					}, 50);
					setTimeout(() => {
						try {
							iframe.focus();
							if (iframe.contentWindow) iframe.contentWindow.focus();
						} catch (e) { }
					}, 200);
				}
			};

			if (this.DOM.el.id === 'team-link' || this.DOM.el.id === 'cv-link') {
				if (typeof openBookOverlay === 'function') {
					openBookOverlay();
				} else {
					const overlay = document.getElementById('book-overlay');
					if (overlay) {
						overlay.style.display = 'block';
						document.body.style.overflow = 'hidden';
						const model3d = document.querySelector('.tm-3d-model-container');
						if (model3d) model3d.style.display = 'none';
						if (window.ThemeExtractor) window.ThemeExtractor.syncIframes();
						focusIframe(overlay);
					}
				}
			} else if (this.DOM.el.id === 'blog-link') {
				if (typeof openBlogOverlay === 'function') {
					openBlogOverlay();
				} else {
					const overlay = document.getElementById('blog-overlay');
					if (overlay) {
						overlay.style.display = 'block';
						document.body.style.overflow = 'hidden';
						const model3d = document.querySelector('.tm-3d-model-container');
						if (model3d) model3d.style.display = 'none';
						if (window.ThemeExtractor) window.ThemeExtractor.syncIframes();
						focusIframe(overlay);
					}
				}
			} else if (this.DOM.el.id === 'contact-link' || (this.DOM.product && this.DOM.product.getAttribute('title') === 'Kontakt')) {
				if (typeof openContactOverlay === 'function') {
					openContactOverlay();
				} else {
					const overlay = document.getElementById('contact-overlay');
					if (overlay) {
						overlay.style.display = 'flex';
						document.body.style.overflow = 'hidden';
					}
				}
			} else {
				DOM.details.fill(this.info);
				DOM.details.open({
					productBg: this.DOM.productBg
				});
			}
		}
	}; // class Item

	const DOM = {};
	DOM.grid = document.querySelector('.grid');
	DOM.content = DOM.grid.parentNode;
	DOM.gridItems = Array.from(DOM.grid.querySelectorAll('.grid__item'));
	let items = [];
	DOM.gridItems.forEach(item => items.push(new Item(item)));

	DOM.details = new Details();

	// Book overlay close button event handler
	const closeBookBtn = document.getElementById('close-book-overlay');
	if (closeBookBtn) {
		closeBookBtn.addEventListener('click', (event) => {
			event.preventDefault();
			event.stopPropagation();
			const overlay = document.getElementById('book-overlay');
			if (overlay) {
				overlay.style.display = 'none';
				document.body.style.overflow = '';
				const model3d = document.querySelector('.tm-3d-model-container');
				if (model3d) model3d.style.display = 'flex';
			}
		});
	}

	// Blog overlay close button event handler
	const closeBlogBtn = document.getElementById('close-blog-overlay');
	if (closeBlogBtn) {
		closeBlogBtn.addEventListener('click', (event) => {
			event.preventDefault();
			event.stopPropagation();
			const overlay = document.getElementById('blog-overlay');
			if (overlay) {
				overlay.style.display = 'none';
				document.body.style.overflow = '';
				const model3d = document.querySelector('.tm-3d-model-container');
				if (model3d) model3d.style.display = 'flex';
			}
		});
	}

	// Contact overlay close button event handler
	const contactOverlay = document.getElementById('contact-overlay');
	const closeContactBtn = document.getElementById('close-contact-overlay');
	if (closeContactBtn && contactOverlay) {
		closeContactBtn.addEventListener('click', (event) => {
			event.preventDefault();
			event.stopPropagation();
			contactOverlay.style.display = 'none';
			document.body.style.overflow = '';
		});
		// Close when clicking backdrop
		contactOverlay.addEventListener('click', (event) => {
			if (event.target === contactOverlay) {
				contactOverlay.style.display = 'none';
				document.body.style.overflow = '';
			}
		});
	}

	const focusOverlayIframe = (overlay) => {
		if (!overlay) return;
		const iframe = overlay.querySelector('iframe');
		if (iframe) {
			setTimeout(() => {
				try {
					iframe.focus();
					if (iframe.contentWindow) iframe.contentWindow.focus();
				} catch (e) { }
			}, 50);
			setTimeout(() => {
				try {
					iframe.focus();
					if (iframe.contentWindow) iframe.contentWindow.focus();
				} catch (e) { }
			}, 200);
		}
	};

	// Oak Wood Navigation Panel Buttons
	const oakBlogBtn = document.getElementById('oak-blog-btn');
	if (oakBlogBtn) {
		oakBlogBtn.addEventListener('click', (event) => {
			event.preventDefault();
			event.stopPropagation();
			const overlay = document.getElementById('blog-overlay');
			if (overlay) {
				overlay.style.display = 'block';
				document.body.style.overflow = 'hidden';
				if (window.ThemeExtractor) window.ThemeExtractor.syncIframes();
				focusOverlayIframe(overlay);
			}
		});
	}

	const oakCvBtn = document.getElementById('oak-cv-btn');
	if (oakCvBtn) {
		oakCvBtn.addEventListener('click', (event) => {
			event.preventDefault();
			event.stopPropagation();
			const overlay = document.getElementById('book-overlay');
			if (overlay) {
				overlay.style.display = 'block';
				document.body.style.overflow = 'hidden';
				if (window.ThemeExtractor) window.ThemeExtractor.syncIframes();
				focusOverlayIframe(overlay);
			}
		});
	}

	const oakContactBtn = document.getElementById('oak-contact-btn');
	if (oakContactBtn) {
		oakContactBtn.addEventListener('click', (event) => {
			event.preventDefault();
			event.stopPropagation();
			if (contactOverlay) {
				contactOverlay.style.display = 'flex';
				document.body.style.overflow = 'hidden';
			}
		});
	}

	// Global keyboard shortcuts for overlays
	document.addEventListener('keydown', (event) => {
		const bookOverlay = document.getElementById('book-overlay');
		const blogOverlay = document.getElementById('blog-overlay');
		const contactOverlay = document.getElementById('contact-overlay');

		// Escape key to close any active overlay
		if (event.key === 'Escape' || event.key === 'Esc') {
			let closed = false;
			if (bookOverlay && bookOverlay.style.display === 'block') {
				bookOverlay.style.display = 'none';
				closed = true;
			}
			if (blogOverlay && blogOverlay.style.display === 'block') {
				blogOverlay.style.display = 'none';
				closed = true;
			}
			if (contactOverlay && contactOverlay.style.display === 'flex') {
				contactOverlay.style.display = 'none';
				closed = true;
			}
			if (closed) {
				document.body.style.overflow = '';
				const model3d = document.querySelector('.tm-3d-model-container');
				if (model3d) model3d.style.display = 'flex';
			}
			return;
		}

		// Forward Arrow keys to active booklet overlay
		if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
			let activeIframe = null;
			if (bookOverlay && bookOverlay.style.display === 'block') {
				activeIframe = bookOverlay.querySelector('iframe');
			} else if (blogOverlay && blogOverlay.style.display === 'block') {
				activeIframe = blogOverlay.querySelector('iframe');
			}

			if (activeIframe) {
				event.preventDefault();
				try {
					if (activeIframe.contentWindow) {
						activeIframe.contentWindow.postMessage({ type: 'KEYDOWN', key: event.key }, '*');
					}
				} catch (e) { }
			}
		}
	});
};


