# s18-project1-th-m

I have developed an addiction for data... This is my way of trying to validate my uses of time, as if knowing about a problem makes me immune to it... This application displays the most important data I have been collecting as it relates to time and my use/waste of it. The red health bar monitors my time in comparison to my goals. The stats-looking numbers underneath are weekly averages, as well as the chart on display.  Swipping over reveals daily time breakdowns.

## Attributes
#### logs

* date
* productivity
* projects
* notes
   
## Rest End Points

### GET
```
/logs
```
get a list of all log entrys.

```
/logs/:id
```
get a specific log entry by id

```
/logs?date={$date}
```
get a specific log entry by date

### POST
```
/logs
```
Create a new log.

### PUT
```
/logs/:id
```
Updates a specific log.