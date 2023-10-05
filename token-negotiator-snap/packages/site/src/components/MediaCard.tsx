import { ReactNode } from 'react';
import styled from 'styled-components';

const CardWrapper = styled.div<{ fullWidth?: true; }>`
  display: flex;
  width: 100%;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.card.default};
  margin-top: 2.4rem;
  margin-bottom: 2.4rem;
  padding: 5px;
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.default};
  box-shadow: ${({ theme }) => theme.shadows.default};
  align-self: stretch;
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
    margin-top: 1.2rem;
    margin-bottom: 1.2rem;
    padding: 1.6rem;
  }
  .card { 
    padding: 7px;
    margin-bottom: 10px;
    img {
      border-radius: 16px;
      width: 100%;
    }
    button {
      margin-top: 10px;
      width: 100%;
    }
  }
`;

export const MediaCard = (props:any) => {
  return (
    <CardWrapper>
      {props.children}
    </CardWrapper>
  );
};
