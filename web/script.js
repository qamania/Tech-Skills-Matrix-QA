var windowWidth = jQuery(window).width();
jQuery(document).ready(function($) {
	if($('.tabs').length) {
		$('.tabHead').on('click', function() {
			if($(this).hasClass('active')) {
				$(this).removeClass('active');
				let tab = '.t' + $(this).attr('data');
				$(this).parent().parent().find(tab).hide().removeClass('vis');
			} else {
				$(this).addClass('active');
				let tabNav = '[data="t' + $(this).attr('data') + '"]';
				$(tabNav).addClass('active');
				let tab = '.t' + $(this).attr('data');
				$(this).parent().parent().find(tab).addClass('vis').fadeIn();
			}
		})
		$('.tabNavEl').on('click', function() {
			if($(this).hasClass('active')) {
				$(this).parent().children().removeClass('active');
				$(this).parent().parent().find('.tabHead').removeClass('active');
				$(this).parent().parent().find('.tabEl.vis').hide().removeClass('vis')
			} else {
				$(this).parent().children().removeClass('active');
				$(this).parent().parent().find('.tabHead').removeClass('active');
				$(this).parent().parent().find('.tabEl.vis').hide().removeClass('vis');  
				$(this).addClass('active');
				let tab = '.' + $(this).attr('data');
				$(this).parent().parent().find(tab).addClass('vis').fadeIn();
		}
		})
	}
})

jQuery(window).resize(function () {
	var oldWindowWidth = windowWidth;
	setTimeout(function() {
		windowWidth = jQuery(window).width();
		if((oldWindowWidth < 768) && (windowWidth > 767)) {
			jQuery('.tabNavEl').removeClass('active');
			jQuery('.tabHead').removeClass('active');
			jQuery('.tabEl.vis').hide().removeClass('vis');
		}
		if((oldWindowWidth > 767) && (windowWidth < 768)) {
			jQuery('.tabNavEl').removeClass('active');
			jQuery('.tabHead').removeClass('active');
			jQuery('.tabEl.vis').hide().removeClass('vis');
		}
	},100)
});

// Self-Evaluation Logic
jQuery(document).ready(function($) {
    // 0. Assessment mode toggle
    var isUkrainian = document.documentElement.lang === 'uk';
    var ASSESSMENT_NAME_KEY = 'assessment-profile-name';
    var ASSESSMENT_TARGET_KEY = 'assessment-profile-target';
    var ASSESS_TEXT_START = isUkrainian ? '▶ Почати самооцінку'      : '▶ Start Self-Assessment';
    var ASSESS_TEXT_STOP  = isUkrainian ? '■ Завершити самооцінку' : '■ End Self-Assessment';
    var CLEAR_PROGRESS_TEXT = isUkrainian
        ? 'Ви впевнені, що хочете очистити прогрес самооцінки?'
        : 'Are you sure you want to clear your self-evaluation progress?';
    var NO_ASSESSMENT_TEXT = isUkrainian
        ? 'Будь ласка, оцініть хоча б одну навичку перед завантаженням звіту.'
        : 'Please assess at least one skill before downloading the report.';
    var PDF_ERROR_TEXT = isUkrainian
        ? 'Не вдалося сформувати PDF-звіт. Спробуйте ще раз.'
        : 'Failed to generate the PDF report. Please try again.';
    var PDF_FILENAME = isUkrainian
        ? 'QA_Skills_Matrix_Report_uk.pdf'
        : 'QA_Skills_Matrix_Report.pdf';
    var PDF_REPORT_TITLE = isUkrainian
        ? 'QA Skills Matrix - Звіт самооцінки'
        : 'QA Skills Matrix - Self Assessment Report';
    var PDF_PROFILE_HEADING = isUkrainian ? 'Профіль оцінювання' : 'Assessment profile';
    var PDF_LABEL_NAME = isUkrainian ? 'Імʼя' : 'Name';
    var PDF_LABEL_TARGET = isUkrainian ? 'Цільовий seniority' : 'Target seniority';
    var PDF_LEGEND_HEADING = isUkrainian ? 'Легенда' : 'Legend';
    var PDF_LEGEND_NONE = isUkrainian ? 'Ще не знаю' : 'Not known yet';
    var PDF_LEGEND_PARTIAL = isUkrainian ? 'Знаю частково' : 'Partially known';
    var PDF_LEGEND_MASTERED = isUkrainian ? 'Впевнено володію' : 'Mastered confidently';
    var PDF_PAGE_WIDTH_PX = 800;
    var PDF_MARGINS_MM = { top: 10, right: 10, bottom: 18, left: 10 };
    var PDF_PRINTABLE_WIDTH_MM = 210 - PDF_MARGINS_MM.left - PDF_MARGINS_MM.right;
    var PDF_PRINTABLE_HEIGHT_MM = 297 - PDF_MARGINS_MM.top - PDF_MARGINS_MM.bottom;
    var PDF_PAGE_HEIGHT_PX = Math.floor((PDF_PAGE_WIDTH_PX * PDF_PRINTABLE_HEIGHT_MM) / PDF_PRINTABLE_WIDTH_MM);
    var pdfLogoAssetPromise = null;
    var $assessmentName = $('#assessment-name');
    var $assessmentTarget = $('#assessment-target-seniority');

    function applyAssessmentMode(active) {
        if (active) {
            $('body').addClass('assessment-mode');
            $('#self-assess-btn').text(ASSESS_TEXT_STOP);
            $('#report-actions').css('display', 'flex');
        } else {
            $('body').removeClass('assessment-mode');
            $('#self-assess-btn').text(ASSESS_TEXT_START);
            $('#report-actions').css('display', 'none');
        }
        localStorage.setItem('assessment-mode', active ? '1' : '0');
    }

    function syncAssessmentProfileFromStorage() {
        $assessmentName.val(localStorage.getItem(ASSESSMENT_NAME_KEY) || '');
        $assessmentTarget.val(localStorage.getItem(ASSESSMENT_TARGET_KEY) || '');
    }

    function getAssessmentProfile() {
        var targetValue = $assessmentTarget.val();
        var targetLabel = '';

        if (targetValue) {
            targetLabel = $assessmentTarget.find('option:selected').text();
        }

        return {
            name: $.trim($assessmentName.val()),
            targetValue: targetValue,
            targetLabel: targetLabel
        };
    }

    // Restore assessment mode on load
    if (localStorage.getItem('assessment-mode') === '1') {
        applyAssessmentMode(true);
    }

    syncAssessmentProfileFromStorage();

    $('#self-assess-btn').on('click', function() {
        var isActive = $('body').hasClass('assessment-mode');
        applyAssessmentMode(!isActive);
    });

    $assessmentName.on('input', function() {
        localStorage.setItem(ASSESSMENT_NAME_KEY, $(this).val());
    });

    $assessmentTarget.on('change', function() {
        localStorage.setItem(ASSESSMENT_TARGET_KEY, $(this).val());
    });

    // 1. Load state from localStorage on page load
    $('.segmented-control').each(function() {
        var skillId = $(this).data('skill-id');
        var savedValue = localStorage.getItem('skill_' + skillId);
        if (savedValue) {
            $(this).find('input[value="' + savedValue + '"]').prop('checked', true);
        }
    });

    // 2. Save state to localStorage on change
    $('.segmented-control input[type="radio"]').on('change', function() {
        var skillId = $(this).closest('.segmented-control').data('skill-id');
        var val = $(this).val();
        localStorage.setItem('skill_' + skillId, val);
    });

    // 3. Clear Progress
    $('#clear-progress').on('click', function(e) {
        e.preventDefault();
        if (confirm(CLEAR_PROGRESS_TEXT)) {
            $('.segmented-control').each(function() {
                var skillId = $(this).data('skill-id');
                localStorage.removeItem('skill_' + skillId);
                $(this).find('input[value="none"]').prop('checked', true);
            });
            localStorage.removeItem(ASSESSMENT_NAME_KEY);
            localStorage.removeItem(ASSESSMENT_TARGET_KEY);
            syncAssessmentProfileFromStorage();
        }
    });

    function getSelectedAssessment($control) {
        var $checked = $control.find('input[type="radio"]:checked').first();
        return $checked.length ? $checked.val() : 'none';
    }

    function buildPdfAssessment(value) {
        return $('<div class="segmented-control pdf-assessment"></div>')
            .attr('data-assessment', value)
            .append('<span class="pdf-segment pdf-segment-none"></span>')
            .append('<span class="pdf-segment pdf-segment-partial"></span>')
            .append('<span class="pdf-segment pdf-segment-mastered"></span>');
    }

    function syncPdfAssessmentControls($sourceTabEl, $cloneTabEl) {
        $cloneTabEl.find('.segmented-control').each(function(index) {
            var value = getSelectedAssessment($sourceTabEl.find('.segmented-control').eq(index));
            $(this).replaceWith(buildPdfAssessment(value));
        });
    }

    function buildPdfLegend() {
        var $legend = $('<div class="pdf-report-legend"></div>');
        var legendItems = [
            { value: 'none', label: PDF_LEGEND_NONE },
            { value: 'partial', label: PDF_LEGEND_PARTIAL },
            { value: 'mastered', label: PDF_LEGEND_MASTERED }
        ];

        $legend.append($('<div class="pdf-report-meta-title"></div>').text(PDF_LEGEND_HEADING));

        legendItems.forEach(function(item) {
            var $row = $('<div class="pdf-report-legend-item"></div>');
            $row.append(buildPdfAssessment(item.value));
            $row.append($('<span class="pdf-report-legend-label"></span>').text(item.label));
            $legend.append($row);
        });

        return $legend;
    }

    function buildPdfProfile(profile) {
        var $profile = $('<div class="pdf-report-meta pdf-report-profile"></div>');
        var hasProfileData = false;

        $profile.append($('<div class="pdf-report-meta-title"></div>').text(PDF_PROFILE_HEADING));

        if (profile.name) {
            hasProfileData = true;
            $profile.append(
                $('<div class="pdf-report-meta-row"></div>')
                    .append($('<span class="pdf-report-meta-label"></span>').text(PDF_LABEL_NAME + ':'))
                    .append($('<span class="pdf-report-meta-value"></span>').text(profile.name))
            );
        }

        if (profile.targetLabel) {
            hasProfileData = true;
            $profile.append(
                $('<div class="pdf-report-meta-row"></div>')
                    .append($('<span class="pdf-report-meta-label"></span>').text(PDF_LABEL_TARGET + ':'))
                    .append($('<span class="pdf-report-meta-value"></span>').text(profile.targetLabel))
            );
        }

        return hasProfileData ? $profile : null;
    }

    function buildPdfReportHeader() {
        var logoSrc = $('.headerTextContainer .logo').first().attr('src');
        var profile = getAssessmentProfile();
        var $header = $('<div class="pdf-report-header"></div>');
        var $headerTop = $('<div class="pdf-report-header-top"></div>');
        var $titleWrap = $('<div class="pdf-report-title-wrap"></div>');
        var $headerMeta = $('<div class="pdf-report-meta-grid"></div>');
        var $profileBlock = buildPdfProfile(profile);

        if (logoSrc) {
            $headerTop.append($('<img class="pdf-report-logo" alt="QAMania logo">').attr('src', logoSrc));
        }

        $titleWrap.append('<div class="pdf-report-kicker">QAMania</div>');
        $titleWrap.append($('<h1 class="pdf-report-title"></h1>').text(PDF_REPORT_TITLE));
        $headerTop.append($titleWrap);
        $header.append($headerTop);

        if ($profileBlock) {
            $headerMeta.append($profileBlock);
        }

        $headerMeta.append(buildPdfLegend());

        if ($headerMeta.children().length) {
            $header.append($headerMeta);
        }

        return $header;
    }

    function buildPdfExportRoot() {
        var $pdfRoot = $('<div class="pdf-export-container"></div>');
        var hasAnyAssessed = false;

        $pdfRoot.append(buildPdfReportHeader());

        $('.tabs').each(function() {
            var $sourceCategory = $(this);
            var $categoryClone = $sourceCategory.clone();
            var $sourceTabEls = $sourceCategory.find('.tabEl');
            var $cloneTabEls = $categoryClone.find('.tabEl');
            var $cloneTabHeads = $categoryClone.find('.tabHead');
            var categoryHasAssessed = false;

            $categoryClone.find('.tabNav').remove();

            $cloneTabEls.each(function(index) {
                var $sourceTabEl = $sourceTabEls.eq(index);
                var $cloneTabEl = $(this);
                var hasAssessment = $sourceTabEl.find('.segmented-control').filter(function() {
                    return getSelectedAssessment($(this)) !== 'none';
                }).length > 0;

                if (!hasAssessment) {
                    $cloneTabHeads.eq(index).remove();
                    $cloneTabEl.remove();
                    return;
                }

                categoryHasAssessed = true;
                hasAnyAssessed = true;
                $cloneTabEl.addClass('vis').css('display', 'block');
                syncPdfAssessmentControls($sourceTabEl, $cloneTabEl);
            });

            if (categoryHasAssessed) {
                $pdfRoot.append($categoryClone);
            }
        });

        return {
            $pdfRoot: $pdfRoot,
            hasAnyAssessed: hasAnyAssessed
        };
    }

    function createPdfStage(className) {
        return $('<div class="pdf-export-container ' + className + '"></div>').css({
            position: 'absolute',
            left: '-9999px',
            top: '0',
            width: PDF_PAGE_WIDTH_PX + 'px',
            background: 'white'
        });
    }

    function createPdfPage() {
        return $('<div class="pdf-page"><div class="pdf-page-content"></div></div>').css({
            width: PDF_PAGE_WIDTH_PX + 'px',
            height: PDF_PAGE_HEIGHT_PX + 'px'
        });
    }

    function buildPdfSectionBlock($description, $tabHead, $tabEl, includeDescription) {
        var $block = $('<div class="pdf-section-block"></div>');

        if (includeDescription && $description && $description.length) {
            $block.append($description.clone());
        }

        $block.append($tabHead.clone());
        $block.append(
            $tabEl.clone()
                .empty()
                .addClass('vis')
                .css('display', 'block')
        );

        return $block;
    }

    function measurePdfBlockHeight($block, $measureStage) {
        var $page = createPdfPage();
        $page.find('.pdf-page-content').append($block.clone());
        $measureStage.empty().append($page);
        return $page.find('.pdf-page-content')[0].scrollHeight;
    }

    function splitPdfTabIntoBlocks($description, $tabHead, $tabEl, includeDescription, $measureStage) {
        var $items = $tabEl.children('li');
        var blocks = [];
        var itemIndex = 0;
        var shouldIncludeDescription = includeDescription;

        while (itemIndex < $items.length) {
            var $block = buildPdfSectionBlock($description, $tabHead, $tabEl, shouldIncludeDescription);
            var $blockTabEl = $block.find('.tabEl').last();
            var blockStartIndex = itemIndex;

            while (itemIndex < $items.length) {
                $blockTabEl.append($items.eq(itemIndex).clone());

                if (measurePdfBlockHeight($block, $measureStage) > PDF_PAGE_HEIGHT_PX) {
                    $blockTabEl.children().last().remove();

                    if (itemIndex === blockStartIndex) {
                        $blockTabEl.append($items.eq(itemIndex).clone());
                        itemIndex += 1;
                    }
                    break;
                }

                itemIndex += 1;
            }

            blocks.push($block);
            shouldIncludeDescription = false;
        }

        return blocks;
    }

    function buildPdfBlocks($pdfRoot, $measureStage) {
        var blocks = [];

        $pdfRoot.children().each(function() {
            var $child = $(this);

            if ($child.hasClass('pdf-report-header')) {
                blocks.push($('<div class="pdf-section-block pdf-header-block"></div>').append($child.clone()));
                return;
            }

            if (!$child.hasClass('tabs')) {
                return;
            }

            var $description = $child.children('.description').first();
            var $tabBox = $child.children('.tabBox').first();
            var $tabHeads = $tabBox.children('.tabHead');
            var $tabEls = $tabBox.children('.tabEl');
            var includeDescription = true;

            $tabEls.each(function(index) {
                blocks = blocks.concat(
                    splitPdfTabIntoBlocks(
                        $description,
                        $tabHeads.eq(index),
                        $(this),
                        includeDescription,
                        $measureStage
                    )
                );
                includeDescription = false;
            });
        });

        return blocks;
    }

    function appendPdfBlockIfFits($page, $block) {
        var $pageContent = $page.find('.pdf-page-content');
        $pageContent.append($block);

        if ($pageContent[0].scrollHeight <= PDF_PAGE_HEIGHT_PX) {
            return true;
        }

        $block.detach();
        return false;
    }

    function buildPaginatedPdfPages($pdfRoot) {
        var $measureStage = createPdfStage('pdf-measure-stage');
        var $pagesStage = createPdfStage('pdf-pages-stage');
        var blocks;
        var $currentPage;

        $('body').append($measureStage, $pagesStage);
        blocks = buildPdfBlocks($pdfRoot, $measureStage);
        $measureStage.remove();

        $currentPage = createPdfPage();
        $pagesStage.append($currentPage);

        blocks.forEach(function($block) {
            if (appendPdfBlockIfFits($currentPage, $block.clone())) {
                return;
            }

            $currentPage = createPdfPage();
            $pagesStage.append($currentPage);
            appendPdfBlockIfFits($currentPage, $block.clone());
        });

        return $pagesStage;
    }

    function waitForPdfLayout() {
        return new Promise(function(resolve) {
            requestAnimationFrame(function() {
                requestAnimationFrame(resolve);
            });
        });
    }

    function waitForPdfImages($pdfRoot) {
        var images = $pdfRoot.find('img').toArray();

        if (!images.length) {
            return Promise.resolve();
        }

        return Promise.all(images.map(function(image) {
            if (image.complete && image.naturalWidth > 0) {
                return Promise.resolve();
            }

            return new Promise(function(resolve) {
                $(image).one('load error', resolve);
            });
        }));
    }

    function getPdfLogoAsset() {
        if (!pdfLogoAssetPromise) {
            var logoSrc = $('.headerTextContainer .logo').first().attr('src');

            pdfLogoAssetPromise = new Promise(function(resolve, reject) {
                if (!logoSrc) {
                    reject(new Error('Logo source not found.'));
                    return;
                }

                var img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = function() {
                    var canvas = document.createElement('canvas');
                    var context = canvas.getContext('2d');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    context.drawImage(img, 0, 0);
                    resolve({
                        dataUrl: canvas.toDataURL('image/png'),
                        width: img.naturalWidth,
                        height: img.naturalHeight
                    });
                };
                img.onerror = function() {
                    reject(new Error('Failed to load logo image.'));
                };
                img.src = logoSrc;
            });
        }

        return pdfLogoAssetPromise;
    }

    async function renderPdfPages($pagesStage) {
        await waitForPdfLayout();
        await waitForPdfImages($pagesStage);

        if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
        }

        var canvases = [];
        var pageElements = $pagesStage.find('.pdf-page').toArray();
        var pageIndex;

        for (pageIndex = 0; pageIndex < pageElements.length; pageIndex += 1) {
            canvases.push(await window.html2canvas(pageElements[pageIndex], {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            }));
        }

        return canvases;
    }

    function buildPdfDocument(pageCanvases, logoAsset) {
        var jsPDF = window.jspdf && window.jspdf.jsPDF;
        var pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        var printableWidth = pdf.internal.pageSize.getWidth() - PDF_MARGINS_MM.left - PDF_MARGINS_MM.right;
        var printableHeight = pdf.internal.pageSize.getHeight() - PDF_MARGINS_MM.top - PDF_MARGINS_MM.bottom;
        var pageIndex = 0;
        var footerLogoWidth = 24;
        var footerLogoHeight = logoAsset
            ? (logoAsset.height * footerLogoWidth) / logoAsset.width
            : 0;

        pageCanvases.forEach(function(pageCanvas) {
            if (pageIndex > 0) {
                pdf.addPage();
            }

            pdf.addImage(
                pageCanvas.toDataURL('image/jpeg', 0.98),
                'JPEG',
                PDF_MARGINS_MM.left,
                PDF_MARGINS_MM.top,
                printableWidth,
                printableHeight,
                undefined,
                'FAST'
            );

            if (pageIndex > 0 && logoAsset) {
                pdf.addImage(
                    logoAsset.dataUrl,
                    'PNG',
                    pdf.internal.pageSize.getWidth() - PDF_MARGINS_MM.right - footerLogoWidth,
                    pdf.internal.pageSize.getHeight() - PDF_MARGINS_MM.bottom + ((PDF_MARGINS_MM.bottom - footerLogoHeight) / 2),
                    footerLogoWidth,
                    footerLogoHeight
                );
            }

            pageIndex += 1;
        });

        return pdf;
    }

    // 4. Download PDF Report
    $('#download-report').on('click', async function(e) {
        e.preventDefault();

        var exportState = buildPdfExportRoot();
        var $pdfRoot = exportState.$pdfRoot;

        if (!exportState.hasAnyAssessed) {
            alert(NO_ASSESSMENT_TEXT);
            return;
        }

        try {
            if (typeof window.html2canvas !== 'function' || !window.jspdf || !window.jspdf.jsPDF) {
                throw new Error('PDF dependencies are not available.');
            }

            var $pagesStage = buildPaginatedPdfPages($pdfRoot);
            var pageCanvases = await renderPdfPages($pagesStage);
            var logoAsset = await getPdfLogoAsset().catch(function() {
                return null;
            });
            var pdf = buildPdfDocument(pageCanvases, logoAsset);
            pdf.save(PDF_FILENAME);
        } catch (error) {
            console.error('Failed to generate PDF report.', error);
            alert(PDF_ERROR_TEXT);
        } finally {
            $('.pdf-pages-stage, .pdf-measure-stage').remove();
        }
    });
});
