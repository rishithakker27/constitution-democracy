# Transcript: 01 core api measure constitution 10axes

## [USER]

see my code and how I use API codes to meausre a consitution on these 10 axis? Now, I want to verify if the AI has actually done a good job at it. Look at my file with the data on constituional features and the codebook for it. That is the ccpnc data. Can we crete a typology or put all of those variables through another API call with detailed instucitnos on how to grade them? Essentially create another score for the countries on those 10 axis without using the text of the constitution, instead using the features here.

---

## [CLAUDE]

Now I understand the mapping perfectly. The LLM `constitution_id` year = Constitute project revision year. The CCPCNC `systyear` = the year the constitutional system was enacted. The `constitution_metadata.csv` has both. I need to update the merge logic in the notebook to use this bridge:

---

## [USER]

what are the results in the ccpnc scores notebook? Do you think the LLM scores are fair based on the corletations? Can I use them for analysis. Alternatively, should I use a Chatbot to evaluate the numerificaiton of the institutins  in the ccpnc scores?
