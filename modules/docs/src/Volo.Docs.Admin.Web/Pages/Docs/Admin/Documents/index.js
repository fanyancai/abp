$(function () {
    var l = abp.localization.getResource('Docs');
    var service = window.volo.docs.admin.documentsAdmin;

    var getFormattedDate = function ($datePicker) {
        return $datePicker.data().datepicker.getFormattedDate('yyyy-mm-dd');
    };
    
    var $projectId = $('#ProjectId');
    var $version = $('#Version');
    var $languageCode = $('#LanguageCode');

    function $getOptions($select){
        var select = $select.get(0);
        return $(select.options)
    }

    function showLanguages(){
        var selectedProjectId = $projectId.val();
        var selectedVersion = $version.val();
        var languages = $getOptions($languageCode);
        languages.each(function(){
            var language = $(this);
            var languageCodeDto = language.attr('data-language');
            if(!languageCodeDto) return;
            languageCodeDto = JSON.parse(languageCodeDto);
            if((!selectedVersion || languageCodeDto.Versions.includes(selectedVersion)) 
                && (!selectedProjectId || languageCodeDto.ProjectIds.includes(selectedProjectId)))
            {
                language.show();
            }
            else{
                language.hide();
                if(language.is(':selected')){
                    $languageCode.val('');
                }
            }
        });
    }
    function showVersions(){
        var selectedProjectId = $projectId.val();
        var selectedLanguageCode = $languageCode.val();
        var versions = $getOptions($version);
        versions.each(function(){
            var version = $(this);
            var verisonDto = version.attr('data-version');
            if(!verisonDto) return;
            verisonDto = JSON.parse(verisonDto);
            if((!selectedLanguageCode || verisonDto.Languages.includes(selectedLanguageCode)) 
                && (!selectedProjectId || verisonDto.ProjectIds.includes(selectedProjectId)))
            {
                version.show();
            }
            else{
                version.hide();
                if(version.is(':selected')){
                    $version.val('');
                }
            }
        });
    }
    $projectId.on('change', function () {
        showVersions();
        showLanguages();
    });

    $version.on('change', function () {
        showLanguages();
    });
    
    $languageCode.on('change', function () {
        showVersions();
    });
    
    var getFilter = function () {
        return {
            projectId: $('#ProjectId').val(),
            name: $('#Name').val(),
            version: $('#Version').val(),
            languageCode: $('#LanguageCode').val(),
            format: $('#Format').val(),
            creationTimeMin: getFormattedDate($('#CreationTimeMin')),
            creationTimeMax: getFormattedDate($('#CreationTimeMax')),
            lastUpdatedTimeMin: getFormattedDate($('#LastUpdatedTimeMin')),
            lastUpdatedTimeMax: getFormattedDate($('#LastUpdatedTimeMax')),
            lastSignificantUpdateTimeMin: getFormattedDate($('#LastSignificantUpdateTimeMin')),
            lastSignificantUpdateTimeMax: getFormattedDate($('#LastSignificantUpdateTimeMax')),
            lastCachedTimeMin: getFormattedDate($('#LastCachedTimeMin')),
            lastCachedTimeMax: getFormattedDate($('#LastCachedTimeMax')),
        };
    };

    var parseDateToLocaleDateString = function (date) {
        var parsedDate = Date.parse(date);
        return new Date(parsedDate).toLocaleDateString(
            abp.localization.currentCulture.name
        );
    };

    var dataTable = $('#DocumentsTable').DataTable(
        abp.libs.datatables.normalizeConfiguration({
            processing: true,
            serverSide: true,
            scrollX: true,
            paging: true,
            searching: false,
            autoWidth: false,
            scrollCollapse: true,
            ajax: abp.libs.datatables.createAjax(service.getAll, getFilter),
            columnDefs: [
                {
                    rowAction: {
                        items: [
                            {
                                text: l('RemoveFromCache'),
                                visible: abp.auth.isGranted(
                                    'Docs.Admin.Documents'
                                ),
                                action: function (data) {
                                    service
                                        .removeFromCache(data.record.id)
                                        .then(function () {
                                            abp.notify.success(l('RemovedFromCache'));
                                            dataTable.ajax.reload();
                                        });
                                },
                            },
                            {
                                text: l('ReIndex'),
                                visible: abp.auth.isGranted(
                                    'Docs.Admin.Documents'
                                ),
                                confirmMessage: function (data) {
                                    return l('ReIndexDocumentConfirmation');
                                },
                                action: function (data) {
                                    service
                                        .reindex(data.record.id)
                                        .then(function () {
                                            abp.message.success(l('ReindexCompleted'));
                                            dataTable.ajax.reload();
                                        });
                                },
                            }
                        ],
                    },
                },
                {
                    target: 0,
                    data: 'projectName',
                },
                {
                    target: 1,
                    data: 'name',
                },
                {
                    target: 2,
                    data: 'version',
                },
                {
                    target: 3,
                    data: 'languageCode',
                },
                {
                    target: 4,
                    data: 'fileName',
                },
                {
                    target: 5,
                    data: 'format',
                },
                {
                    target: 6,
                    data: 'creationTime',
                    render: function (creationTime) {
                        if (!creationTime) {
                            return '';
                        }

                        return parseDateToLocaleDateString(creationTime);
                    },
                },
                {
                    target: 7,
                    data: 'lastUpdatedTime',
                    render: function (lastUpdatedTime) {
                        if (!lastUpdatedTime) {
                            return '';
                        }

                        return parseDateToLocaleDateString(lastUpdatedTime);
                    },
                },
                {
                    target: 8,
                    data: 'lastSignificantUpdateTime',
                    render: function (lastSignificantUpdateTime) {
                        if (!lastSignificantUpdateTime) {
                            return '';
                        }

                        return parseDateToLocaleDateString(lastSignificantUpdateTime);
                    },
                },
                {
                    target: 9,
                    data: 'lastCachedTime',
                    render: function (lastCachedTime) {
                        if (!lastCachedTime) {
                            return '';
                        }

                        return parseDateToLocaleDateString(lastCachedTime);
                    },
                },
            ],
        })
    );

    $("#FilterForm input[type='text']").keypress(function (e) {
        if (e.which === 13) {
            dataTable.ajax.reload();
        }
    });

    $('#SearchButton').click(function (e) {
        e.preventDefault();
        dataTable.ajax.reload();
    });

    $("#AdvancedFilterSectionToggler").click(function (e) {
        $("#AdvancedFilterSection").toggle();
    });
});
