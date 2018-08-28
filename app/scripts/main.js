if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function(predicate) {
     // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return undefined.
      return undefined;
    }
  });
}


(function() {
  const statesAbbr = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AS': 'American Samoa', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'DC': 'District Of Columbia', 'FM': 'Federated States Of Micronesia', 'FL': 'Florida', 'GA': 'Georgia', 'GU': 'Guam', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MH': 'Marshall Islands', 'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'MP': 'Northern Mariana Islands', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PW': 'Palau', 'PA': 'Pennsylvania', 'PR': 'Puerto Rico', 'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VI': 'Virgin Islands', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
  };
  const techs = [ {521: 'Copper'}, {522: 'Vantage'}, {523: 'FIOS'}, {524: 'Default'}];

  let width = 960;
  let height = 600;
  let active = d3.select(null);
  const svg = d3.select('.map').append('svg')
    .attr('class', 'states zips')
    .attr('width', width)
    .attr('height', height);

  const div = d3.select('div.info');

  const projection = d3.geo.albersUsa()
  	.scale(1000)
  	.translate([width / 2.6, height / 2.6]);

  const path = d3.geo.path()
  	.projection(projection);

  queue()
     .defer(d3.json, 'geo_states.json')
     .defer(d3.json, 'zips_caf_ftr.json')
     .defer(d3.json, 'states.json')
     .await(createMap);

  function createMap ( error, us, zp, st ) {
    let totalFans = 0;
    d3.select('.spinner').attr('class', 'hidden');

    function setFans (info) {
      let city = '';
      let fans = '';
      let className = '';
      st.cities.forEach((town) => {
        // if ( Number(info.properties.zip) >= Number(town.range[0]) && Number(info.properties.zip) <= Number(town.range[1]) ) {
        //   city = town.name;
        //   fans = town.fans;
        //   className = 'fb-fans';
        // }
      });

      return function (dta) {
        if ( dta === 'city' ) {
          return city;
        } else if ( dta === 'fans' ) {
          return fans;
        } else {
          return className;
        }
      }
    }

    st.cities.forEach((town) => {
      totalFans += Number(town.fans);
    });

    d3.select('.total-fans').text(totalFans);

    const states = svg.append('g')
      .selectAll('state')
      .data(topojson.feature(us, us.objects.states).features)
      .enter().append('path')
      .attr('class', d => 'state zone-a')
      .attr('data-zip', d => d.properties.zip)
      .attr('data-state', d => d.properties.state)
      .attr('data-name', d => d.properties.name)
      .attr('d', path);

    const zipCodes = svg.append('g')
      .selectAll('zip')
      .data(topojson.feature(zp, zp.objects.zip_codes_for_the_usa).features)
      .enter().append('path')
      .attr('class', (d) => 'zip')
      .attr('data-zip', d => d.properties.zip)
      .attr('data-state', d => d.properties.state)
      .attr('data-name', d => d.properties.name)
      .attr('data-fans', d => setFans(d)('fans'))
      .attr('data-city', d => setFans(d)('city'))
      .attr('d', path)
      .on('mouseover', (d) => {
        let nFans = setFans(d) || '';
        d3.select('.name-info').text(d.properties.name.toLowerCase())
        d3.select('.zip-info').text(d.properties.zip)
        d3.select('.state-info').text(statesAbbr[d.properties.state].toLowerCase())
        // d3.select('.tech-info').text(techs.find((tec) => tec[d.properties.technology])[d.properties.technology])
        // d3.select('.fans-info').text( d => nFans('fans').length ? `${nFans('fans')} fans in city of ${nFans('city')}` : '')
      });

    const stateNames = svg.selectAll('text')
      .data(topojson.feature(us, us.objects.states).features)
      .enter()
      .append('svg:text')
      .text((d) => st[d.properties.name].abbr)
        .attr('fill', 'black')
        .attr('x', (d) => {
          if (st[d.properties.name].abbr === 'CT') {
            return path.centroid(d)[0] + 15;
          } else {
            return path.centroid(d)[0] || 0
          }
        })
        .attr('y', d => path.centroid(d)[1] || 0)
        .attr('text-anchor','middle')
        .attr('class','state-name')
        .on('click', clicked);

        function clicked (d) {
          if (active.node() === this) return reset();
          active.classed('active', false);
          active = d3.select(this).classed('active', true);

          let bounds = path.bounds(d),
            dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2,
            scale = .9 / Math.max(dx / width, dy / height),
            translate = [width / 2 - scale * x, height / 2 - scale * y];

          function transitate (el) {
            el.transition()
              .duration(750)
              .style('stroke-width', `${1.5 / scale} px`)
              .attr('transform', `translate( ${translate} )scale( ${scale} )`);
          }

          transitate(states);
          transitate(zipCodes);
          transitate(stateNames);
        }

        function reset () {
          active.classed('active', false);
          active = d3.select(null);

          function transitate (el) {
            el.transition()
                .duration(750)
                .style('stroke-width', '1.5px')
                .attr('transform', '');
          }

          transitate(states);
          transitate(zipCodes);
          transitate(stateNames);
        }

    let zoomfactor = 1;

    const zoom = d3.behavior.zoom()
      .on('zoom', redraw);

    d3.select('#zoomIn').on('click', function (){
        zoomfactor = zoomfactor + 0.2;
        zoom.scale(zoomfactor).event(states);
    });

    d3.select('#zoomOut').on('click', function (){
        zoomfactor = zoomfactor - 0.2;
        zoom.scale(zoomfactor).event(states);
    });

    function redraw() {
      let translation = `translate(${d3.event.translate.join(',')})scale(${d3.event.scale})`;
      states.attr('transform', translation);
      zipCodes.attr('transform', translation);
      stateNames.attr('transform', translation);
    }

    svg.call(zoom);
  }
})();
