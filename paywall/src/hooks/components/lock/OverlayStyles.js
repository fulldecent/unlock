import styled from 'styled-components'

export const FullPage = styled.div`
  position: fixed; /* Sit on top of the page content */
  width: 100%; /* Full width (cover the whole page) */
  height: 100%; /* Full height (cover the whole page) */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    rgba(255, 255, 255, 0) 18%,
    rgba(255, 255, 255, 0) 29%,
    var(--offwhite) 48%
  );
`

export const Banner = styled.div.attrs(({ scrollPosition }) => ({
  style: {
    height: Math.min(scrollPosition, 100) + '%',
  },
}))`
  position: fixed;
  display: grid;
  min-height: 375px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--offwhite);
  justify-items: center;
  padding: 32px;
  padding-bottom: 100px;
  grid-gap: 24px;
  align-self: center;
`

export const Headline = styled.h1`
  font-size: 20px;
  font-family: 'Roboto', sans-serif;
  font-weight: bold;
  color: var(--slate);
  text-align: center;
`

export const Locks = styled.ul`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 32px;
  list-style: none;
  margin: 0px;
  padding: 0px;
  grid-row: 2;
  grid-column: 1;
`
