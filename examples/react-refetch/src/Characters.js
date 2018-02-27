import React from 'react'
import { connect } from 'react-refetch'

const Characters = ({ charactersFetch }) =>
  charactersFetch.fulfilled ? (
    <ul>
      {charactersFetch.value.results.map(result => (
        <li key={result.url}>{result.name}</li>
      ))}
    </ul>
  ) : null

export default connect(() => ({
  charactersFetch: 'https://swapi.co/api/people/',
}))(Characters)
