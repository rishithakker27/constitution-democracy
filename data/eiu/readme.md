# Democratic Culture Index - Data package

This data package contains the data that powers the chart ["Democratic Culture Index"](https://ourworldindata.org/grapher/democratic-culture-index-eiu?v=1&csvType=full&useColumnShortNames=false) on the Our World in Data website.

## CSV Structure

The high level structure of the CSV file is that each row is an observation for an entity (usually a country or region) and a timepoint (usually a year).

The first two columns in the CSV file are "Entity" and "Code". "Entity" is the name of the entity (e.g. "United States"). "Code" is the OWID internal entity code that we use if the entity is a country or region. For most countries, this is the same as the [iso alpha-3](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3) code of the entity (e.g. "USA") - for non-standard countries like historical countries these are custom codes.

The third column is either "Year" or "Day". If the data is annual, this is "Year" and contains only the year as an integer. If the column is "Day", the column contains a date string in the form "YYYY-MM-DD".

The remaining columns are the data columns, each of which is a time series. If the CSV data is downloaded using the "full data" option, then each column corresponds to one time series below. If the CSV data is downloaded using the "only selected data visible in the chart" option then the data columns are transformed depending on the chart type and thus the association with the time series might not be as straightforward.


## Metadata.json structure

The .metadata.json file contains metadata about the data package. The "charts" key contains information to recreate the chart, like the title, subtitle etc.. The "columns" key contains information about each of the columns in the csv, like the unit, timespan covered, citation for the data etc..

## About the data

Our World in Data is almost never the original producer of the data - almost all of the data we use has been compiled by others. If you want to re-use data, it is your responsibility to ensure that you adhere to the sources' license and to credit them correctly. Please note that a single time series may have more than one source - e.g. when we stich together data from different time periods by different producers or when we calculate per capita metrics using population data from a second source.

### How we process data at Our World In Data
All data and visualizations on Our World in Data rely on data sourced from one or several original data providers. Preparing this original data involves several processing steps. Depending on the data, this can include standardizing country names and world region definitions, converting units, calculating derived indicators such as per capita measures, as well as adding or adapting metadata such as the name or the description given to an indicator.
[Read about our data pipeline](https://docs.owid.io/projects/etl/)

## Detailed information about each time series


## Democratic Culture Index
Extent to which citizens prefer democracy over other political systems. It ranges from 0 to 10 (strongest preference for democracy).
Last updated: March 5, 2025  
Next update: July 2026  
Date range: 2006–2024  


### How to cite this data

#### In-line citation
If you have limited space (e.g. in data visualizations), you can use this abbreviated in-line citation:  
Economist Intelligence Unit (2006-2024) – processed by Our World in Data

#### Full citation
Economist Intelligence Unit (2006-2024) – processed by Our World in Data. “Democratic Culture Index” [dataset]. Economist Intelligence Unit, “Democracy Index 2021: The China challenge”; Economist Intelligence Unit, “Democracy Index 2022: Frontline democracy and the battle for Ukraine”; Economist Intelligence Unit, “Democracy Index 2023: Age of Conflict”; Economist Intelligence Unit, “Democracy Index 2024: What's wrong with representative democracy?”; Gapminder, “Democracy Index v4”; Various sources, “Population” [original data].
Source: Economist Intelligence Unit (2006-2024) – processed by Our World In Data

### Sources

#### Economist Intelligence Unit – Democracy Index 2021: The China challenge
Retrieved on: 2024-05-22  
Retrieved from: https://www.economistgroup.com/group-news/economist-intelligence/democracy-index-2021-less-than-half-the-world-lives-in-a-democracy  

#### Economist Intelligence Unit – Democracy Index 2022: Frontline democracy and the battle for Ukraine
Retrieved on: 2024-05-22  
Retrieved from: https://www.eiu.com/n/campaigns/democracy-index-2022  

#### Economist Intelligence Unit – Democracy Index 2023: Age of Conflict
Retrieved on: 2024-05-22  
Retrieved from: https://www.economistgroup.com/group-news/economist-intelligence/eius-2023-democracy-index-conflict-and-polarisation-drive-a-new-low-for  

#### Economist Intelligence Unit – Democracy Index 2024: What's wrong with representative democracy?
Retrieved on: 2025-03-05  
Retrieved from: https://www.eiu.com/n/campaigns/democracy-index-2024/  

#### Gapminder – Democracy Index
Retrieved on: 2024-05-22  
Retrieved from: https://www.gapminder.org/data/documentation/democracy-index/  

#### Various sources – Population
Retrieved on: 2026-03-31  
Retrieved from: https://ourworldindata.org/population-sources  

#### Notes on our processing step for this indicator
We source the data from Gapminder for the years 2006 to 2020, and directly from the Economist Intelligence Unit for more recent years.

For the world as a whole and for each region (as [defined by us](https://ourworldindata.org/grapher/continents-according-to-our-world-in-data)), we calculate both simple country averages and [population-weighted](https://ourworldindata.org/explorers/democracy?country=OWID_WRL~OWID_AFR~OWID_ASI~OWID_EUR~OWID_NAM~OWID_OCE~OWID_SAM&Dataset=Economist+Intelligence+Unit&Metric=Electoral+democracy&Sub-metric=%C2%AD%C2%AD%C2%AD%C2%AD%C2%AD%C2%AD%C2%ADMain+index+weighted+by+population) averages. A population-weighted average assigns more weight to countries with larger populations, so that the results better reflect the experiences of the average person.


## World region according to OWID
Regions defined by Our World in Data, which are used in OWID charts and maps.
Last updated: January 1, 2023  
Date range: 2023–2023  


### How to cite this data

#### In-line citation
If you have limited space (e.g. in data visualizations), you can use this abbreviated in-line citation:  
Our World in Data – processed by Our World in Data

#### Full citation
Our World in Data – processed by Our World in Data. “World region according to OWID” [dataset]. Our World in Data, “Regions” [original data].
Source: Our World in Data

### Source

#### Our World in Data – Regions


    