javascript.javascriptGenerator.forBlock['open_gate_with_speed'] = function(block, generator) {

  var speed = block.getFieldValue('SPEED');

  var angle = speed * 9;

  var code = 'servo.write(' + angle + ');\\n';

  return code;
};