class SharedProject < ActiveRecord::Base
  
  def as_json(options={})
    super(:only => [ :title, :description, :raw_code, :compiled_code ])
  end

end
