import React from 'react';
import {
    Pagination as CanvasPagination,
    getLastPage,
    getVisibleResultsMax,
    getVisibleResultsMin,
} from '@workday/canvas-kit-react/pagination';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';
import { InputGroup } from '@workday/canvas-kit-react/text-input';
import { styled } from '@workday/canvas-kit-react/style';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
}

const StyledInputGroup = styled(InputGroup)({
    '& input': {
        backgroundColor: 'var(--bg-color, #fff)',
        color: 'var(--text-color, #000)',
        borderColor: 'var(--border-color, #ccc)',
    },
    '& label': {
        color: 'var(--text-color, #000)',
    }
});

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage
}) => {
    const { language } = useLanguageStore();
    const t = translations[language] || translations.en;

    const lastPage = getLastPage(itemsPerPage, totalItems);

    const handlePageChange = (pageNumber: number) => {
        onPageChange(pageNumber);
    };

    return (
        <div dir={t.rtl ? 'rtl' : 'ltr'} style={{ 
            '--bg-color': 'var(--color-bg-surface)',
            '--text-color': 'var(--color-text-primary)',
            '--border-color': 'var(--color-border)',
         } as React.CSSProperties}>
            <CanvasPagination
                onPageChange={handlePageChange}
                aria-label="Pagination"
                lastPage={lastPage}
                currentPage={currentPage}
            >
                <CanvasPagination.Controls>
                    <CanvasPagination.JumpToFirstButton aria-label={t.first} />
                    <CanvasPagination.StepToPreviousButton aria-label={t.previous} />
                    <CanvasPagination.PageList>
                        {({ state }) =>
                            state.range.map(pageNumber => (
                                <CanvasPagination.PageListItem key={pageNumber}>
                                    <CanvasPagination.PageButton aria-label={`${t.page} ${pageNumber}`} pageNumber={pageNumber} />
                                </CanvasPagination.PageListItem>
                            ))
                        }
                    </CanvasPagination.PageList>
                    <CanvasPagination.StepToNextButton aria-label={t.next} />
                    <CanvasPagination.JumpToLastButton aria-label={t.last} />
                    <CanvasPagination.GoToForm>
                        <StyledInputGroup>
                            <InputGroup.Input as={CanvasPagination.GoToTextInput} aria-label={t.goTo} />
                            <InputGroup.Label as={CanvasPagination.GoToLabel}>
                                {({ state }) => `${t.of} ${state.lastPage} ${t.page}`}
                            </InputGroup.Label>
                        </StyledInputGroup>
                    </CanvasPagination.GoToForm>
                </CanvasPagination.Controls>
                <CanvasPagination.AdditionalDetails shouldHideDetails>
                    {() =>
                        `${getVisibleResultsMin(currentPage, itemsPerPage)}-${getVisibleResultsMax(
                            currentPage,
                            itemsPerPage,
                            totalItems
                        )} ${t.of} ${totalItems} ${t.products}`
                    }
                </CanvasPagination.AdditionalDetails>
            </CanvasPagination>
        </div>
    );
};

export default Pagination;
